const User = require('../models/User');
const Group = require('../models/Group');
const RandomRequest = require('../models/RandomRequest');
const { requestRandomNumber, checkSpecificRequestFulfillment } = require('../smart-contract/vrfIntegration');
const { broadcastRandomNumber } = require('../webSocket'); // Import the WebSocket module
const crypto = require('crypto');

const NUM_GROUPS = 3; // Number of groups to allocate users into
const NUM_VERIFIERS = 15; // Number of verifiers to select
const NUM_PROVIDERS = 3; // Number of providers to select

// Function to select users based on Rule A
const selectUsersBasedOnRuleA = async (randomNumber, verifierCount, providerCount) => {
  const users = await User.find({});

  const usersWithHashModulo = users.map(user => {
    const hashedAddress = crypto.createHash('sha256').update(user.walletAddress).digest('hex');
    const moduloValue = BigInt(`0x${hashedAddress}`) % BigInt(randomNumber);
    return { user, moduloValue };
  });

  usersWithHashModulo.sort((a, b) => (a.moduloValue < b.moduloValue ? -1 : 1));

  const verifiers = usersWithHashModulo
    .filter(({ user }) => user.identity === 'verifier')
    .slice(0, verifierCount)
    .map(({ user }) => user);

  const providers = usersWithHashModulo
    .filter(({ user }) => user.identity === 'provider')
    .slice(0, providerCount)
    .map(({ user }) => user);

  return { verifiers, providers };
};

// Function to sort users deterministically based on the random number
const sortUsersDeterministically = (users, randomNumber) => {
  return users.sort((a, b) => {
    const hashA = crypto.createHash('sha256').update(a.walletAddress + randomNumber).digest('hex');
    const hashB = crypto.createHash('sha256').update(b.walletAddress + randomNumber).digest('hex');
    const bigIntA = BigInt(`0x${hashA}`);
    const bigIntB = BigInt(`0x${hashB}`);
    if (bigIntA < bigIntB) {
      return -1;
    } else if (bigIntA > bigIntB) {
      return 1;
    } else {
      return 0;
    }
  });
};

// Function to allocate users into groups deterministically
const allocateUsersIntoGroupsDeterministically = (verifiers, providers, groupCount, randomNumber) => {
  const groups = Array.from({ length: groupCount }, () => ({ verifiers: [], provider: null, leader: null }));

  providers.forEach((provider, index) => {
    groups[index % groupCount].provider = provider;
  });

  verifiers.forEach((verifier, index) => {
    groups[index % groupCount].verifiers.push(verifier);
  });

  groups.forEach(group => {
    group.leader = group.verifiers.reduce((max, verifier) => {
      const verifierHash = crypto.createHash('sha256').update(verifier.walletAddress + randomNumber).digest('hex');
      const maxHash = crypto.createHash('sha256').update(max.walletAddress + randomNumber).digest('hex');
      return BigInt(`0x${verifierHash}`) > BigInt(`0x${maxHash}`) ? verifier : max;
    }, group.verifiers[0]);
  });

  return groups;
};

// Main group allocation function
const groupUsers = async (req, res) => {
  try {
    // Clear all existing groups in the database
    await Group.deleteMany({});

    // // Request a new Chainlink random number
    // const account = '0x9bB61dcD1A458fFa2d976c78f4a2Aae4f81Da0cc'; // Replace with the actual account to use
    // const { receipt, requestId } = await requestRandomNumber(account);

    // console.log('Transaction receipt:', receipt);
    // console.log('Request ID:', requestId);

    // // Wait for the specific random request to be fulfilled
    // let fulfilled = false;
    // let randomNumber;
    // while (!fulfilled) {
    //   console.log('Checking fulfillment status...');
    //   await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds before checking fulfillment status
    //   const events = await checkSpecificRequestFulfillment(requestId);
    //   if (events.length > 0) {
    //     fulfilled = true;
    //     randomNumber = events[0].returnValues.randomWords[0].toString();
    //     console.log('Random number fulfilled:', randomNumber);
    //   }
    // }


    requestId = '93197867188801296568044086163331375079620424989368734861854331415142315796425';
    randomNumber = '84281606300465785624993331571602207613114054382280637872386505550332737756732';


    // Broadcast the random number to all connected clients
    console.log('Broadcasting the random number to all clients');
    broadcastRandomNumber(randomNumber);

    // Apply Rule A to select users
    const { verifiers, providers } = await selectUsersBasedOnRuleA(randomNumber, NUM_VERIFIERS, NUM_PROVIDERS);

    // Apply deterministic Rule B to allocate selected users into groups
    const sortedVerifiers = sortUsersDeterministically(verifiers, randomNumber);
    const sortedProviders = sortUsersDeterministically(providers, randomNumber);

    const groups = allocateUsersIntoGroupsDeterministically(sortedVerifiers, sortedProviders, NUM_GROUPS, randomNumber);

    console.log('Allocated groups:', groups);

    // Store the allocated groups into the database
    const groupPromises = groups.map(async (group, index) => {
      const newGroup = new Group({
        groupId: index + 1,
        verifiers: group.verifiers.map(user => user._id),
        provider: group.provider._id,
        leader: group.leader._id,
        randomNumber: randomNumber // Store the random number as a string
      });
      return newGroup.save();
    });

    await Promise.all(groupPromises);
    console.log('Groups saved to database');

    // Update the random request status to used
    await RandomRequest.findOneAndUpdate({ requestId }, { used: true });
    console.log('Random request updated to used');

    res.status(201).json({ message: 'Groups allocated successfully', groups, randomNumber });
  } catch (error) {
    console.error('Error in groupUsers:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { groupUsers };
