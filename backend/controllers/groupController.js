const User = require('../models/User');
const Group = require('../models/Group');
const Message = require('../models/Message');
const RandomRequest = require('../models/RandomRequest');
const { requestRandomNumber, checkSpecificRequestFulfillment } = require('../smart-contract/vrfIntegration');
const { broadcastRandomNumber } = require('../webSocket'); // Import the WebSocket module
const crypto = require('crypto');
const { clearMessages } = require('../controllers/messageController');
const { storeGroupHash } = require('../smart-contract/challengeIntegration');
const CryptoJS = require('crypto-js');
const openpgp = require('openpgp');
const {Web3} = require('web3');
const web3 = new Web3(Web3.givenProvider || 'https://sepolia.infura.io/v3/bacfcbcb951e4305867e3b18d3f5da3a'); 

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
    // await clearMessages(req, res);

    await Message.deleteMany({});

    // Request a new Chainlink random number
    const account = '0x9bB61dcD1A458fFa2d976c78f4a2Aae4f81Da0cc'; 
    const { receipt, requestId } = await requestRandomNumber(account);

    console.log('Transaction receipt:', receipt);
    console.log('Request ID:', requestId);

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


    // // requestId = '93197867188801296568044086163331375079620424989368734861854331415142315796425';
    // // randomNumber = '84281606300465785624993331571602207613114054382280637872386505550332737756732';


    // // Broadcast the random number to all connected clients
    // console.log('Broadcasting the random number to all clients');
    // broadcastRandomNumber(randomNumber);

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

const generateNewRandomNumber = (personalHashes) => {
  const combinedHashes = personalHashes.join('');
  return CryptoJS.SHA256(combinedHashes).toString(CryptoJS.enc.Hex);
};

const getNumberWithinRange = (hash, lowerLimit, upperLimit) => {
  const hashInt = BigInt(`0x${hash}`);
  const lower = BigInt(lowerLimit);
  const upper = BigInt(upperLimit);
  const range = upper - lower + BigInt(1);
  const numberWithinRange = hashInt % range + lower;
  return numberWithinRange;
};


const generateGroupHash = (newRandomNumber) => {
  let currentHash = CryptoJS.SHA256(newRandomNumber).toString(CryptoJS.enc.Hex);
  let groupHashArray = [];
  let groupHexArray = [];

  const ranges = [
    { lower: '0x00000000', upper: '0x3FFFFFFF' },
    { lower: '0x40000000', upper: '0x7FFFFFFF' },
    { lower: '0x80000000', upper: '0xFFFFFFFF' },
    { lower: '0x100000000', upper: '0x1FFFFFFFF' },
    { lower: '0x200000000', upper: '0x3FFFFFFFF' },
    { lower: '0x400000000', upper: '0x7FFFFFFFF' },
    { lower: '0x800000000', upper: '0xFFFFFFFFF' },
    { lower: '0x1000000000', upper: '0x1FFFFFFFFF' },
    { lower: '0x2000000000', upper: '0x3FFFFFFFFF' },
    { lower: '0x4000000000', upper: '0x7FFFFFFFFF' },
    { lower: '0x8000000000', upper: '0xFFFFFFFFFF' },
    { lower: '0x10000000000', upper: '0x1FFFFFFFFFF' },
    { lower: '0x20000000000', upper: '0x3FFFFFFFFFF' },
    { lower: '0x40000000000', upper: '0x7FFFFFFFFFF' },
    { lower: '0x80000000000', upper: '0xFFFFFFFFFFF' },
    { lower: '0x100000000000', upper: '0x1FFFFFFFFFFF' },
    { lower: '0x200000000000', upper: '0x3FFFFFFFFFFF' },
    { lower: '0x400000000000', upper: '0x7FFFFFFFFFFF' },
    { lower: '0x800000000000', upper: '0xFFFFFFFFFFFF' },
    { lower: '0x1000000000000', upper: '0x1FFFFFFFFFFFF' },
    { lower: '0x2000000000000', upper: '0x3FFFFFFFFFFFF' },
    { lower: '0x4000000000000', upper: '0x7FFFFFFFFFFFF' },
    { lower: '0x8000000000000', upper: '0xFFFFFFFFFFFFF' },
    { lower: '0x10000000000000', upper: '0x1FFFFFFFFFFFFF' },
    { lower: '0x20000000000000', upper: '0x3FFFFFFFFFFFFF' },
    { lower: '0x40000000000000', upper: '0x7FFFFFFFFFFFFF' },
    { lower: '0x80000000000000', upper: '0xFFFFFFFFFFFFFF' },
    { lower: '0x100000000000000', upper: '0x1FFFFFFFFFFFFFF' },
    { lower: '0x200000000000000', upper: '0x3FFFFFFFFFFFFFF' },
    { lower: '0x400000000000000', upper: '0x7FFFFFFFFFFFFFF' },
    { lower: '0x800000000000000', upper: '0xFFFFFFFFFFFFFFF' },
    { lower: '0x1000000000000000', upper: '0x1FFFFFFFFFFFFFFF' },
    { lower: '0x2000000000000000', upper: '0x3FFFFFFFFFFFFFFF' },
    { lower: '0x4000000000000000', upper: '0x7FFFFFFFFFFFFFFF' },
    { lower: '0x8000000000000000', upper: '0xFFFFFFFFFFFFFFFF' }
  ];

  for (let i = 30; i <= 64; i++) {
    const { lower, upper } = ranges[i - 30];
    const bitValue = getNumberWithinRange(currentHash, lower, upper);
    const bitValueHex = bitValue.toString(16).padStart(8, '0'); // Convert to hex
    console.log(`Bit Hex Value ${i}:`, bitValueHex);
    //const bitValueHash = CryptoJS.SHA256(bitValueHex).toString(CryptoJS.enc.Hex); // Hash it
    const bitValueHash = getSHA256HexToHex(bitValueHex);
    console.log(`Bit Hash Value ${i}:`, bitValueHash);
    groupHashArray.push(`0x${bitValueHash}`);
    groupHexArray.push(bitValueHex);
    currentHash = bitValueHash; // Update the hash for the next iteration
  }

  return groupHashArray;
};

const getSHA256HexToHex = (hex) => {
  if (hex.length % 2 !== 0) {
    hex = '0' + hex;
  }
  const hexBuffer = Buffer.from(hex, 'hex');
  // console.log(`Parsed Buffer: ${hexBuffer.toString('hex')}`);
  return crypto.createHash('sha256').update(hexBuffer).digest('hex');
}





const getPersonalHashes = async (user, password, memberIds) => {
  try {
    // Retrieve all messages from group members to the user
    const messages = await Message.find({
      from: { $in: memberIds },
      to: user._id,
      content: { $exists: true }
    }).sort({ timestamp: -1 }).exec();

    console.log('Retrieved Messages:', messages); // Log the retrieved messages

    // Decrypt messages to get personal hashes
    const personalHashes = await Promise.all(messages.map(async message => {
      try {
        const privateKeyArmored = user.privateKey;
        console.log("privateKeyArmored: ", privateKeyArmored);
        const privateKey = await openpgp.decryptKey({
          privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
          passphrase: password
        });

        const decrypted = await openpgp.decrypt({
          message: await openpgp.readMessage({ armoredMessage: message.content }),
          decryptionKeys: privateKey
        });

        return decrypted.data;
      } catch (error) {
        console.error('Error decrypting message:', error);
        return null;
      }
    }));

    const uniqueHashes = [...new Set(personalHashes.filter(hash => hash !== null))];
    console.log('Decrypted Personal Hashes:', uniqueHashes); // Log the decrypted personal hashes

    return uniqueHashes;
  } catch (error) {
    console.error('Error in getPersonalHashes:', error);
    throw error;
  }
};



const generateGroupHashController = async (req, res) => {
  try {
    console.log("USER IS: ", req.user);
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const group = await Group.findOne({ leader: req.user.id });
    if (!group) {
      return res.status(403).json({ message: 'Access denied, only leaders can generate group hash' });
    }

    const provider = await User.findById(group.provider);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const memberIds = group.verifiers.concat(group.provider).map(member => member._id);
    const personalHashes = await getPersonalHashes(user, req.user.tempPassword, memberIds);

    if (personalHashes.length === 0) {
      return res.status(400).json({ error: 'No personal hashes found' });
    }

    const newRandomNumber = generateNewRandomNumber(personalHashes);
    const groupHashArray = generateGroupHash(newRandomNumber);
    //console.log("groupHashArray: ", groupHashArray);

    //const recipient = provider.walletAddress;
    const recipient = '0xF42a164E2E53e338c7b8988cf30fDE43FFF86393';


    const challengeText = "emit the challenge";

    const from = '0x9bB61dcD1A458fFa2d976c78f4a2Aae4f81Da0cc';
    const privateKey = '2c02bc078bc2f0702f1bbbd1e32d56e3ad8fcc317bc83c1856e34f0528f437a8'; 

    // const from = user.walletAddress; 
    // const privateKey = user.walletPrivateKey;

    const balance = await web3.eth.getBalance(from);
    const gasPrice = await web3.eth.getGasPrice();
    const gasLimit = 3000000;
    const requiredBalance = BigInt(gasPrice) * BigInt(gasLimit);

    console.log("requiredBalance: ", requiredBalance);
    console.log("balance: ", balance);

    if (BigInt(balance) < requiredBalance) {
      return res.status(400).json({ message: `Insufficient funds for gas. Required: ${Number(requiredBalance) / 1e18} ETH, Available: ${Number(balance) / 1e18} ETH` });
    }

    console.log("wallet private key is: ", privateKey);

    // const receipt = await storeGroupHash(from, privateKey, recipient, challengeText, groupHashArray);
    // console.log('Transaction receipt:', receipt);

    // const storedGroupHash = await getStoredGroupHash(recipient);
    // console.log('Stored Group Hash:', storedGroupHash);


    res.status(200).json({ groupHashArray });
  } catch (error) {
    console.error('Error in generateGroupHashController:', error);
    res.status(500).json({ error: error.message });
  }
};


const updateLeader = async (req, res) => {
  try {
    const { newLeaderId } = req.body;

    // Find the group containing the new leader as one of the members
    const group = await Group.findOne({
      $or: [
        { 'verifiers': newLeaderId },
        { 'provider': newLeaderId }
      ]
    });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.leader = newLeaderId;
    await group.save();

    res.status(200).json({ message: 'Leader updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { groupUsers, generateGroupHash: generateGroupHashController, updateLeader, getPersonalHashes };
