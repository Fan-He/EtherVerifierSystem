const User = require('../models/User');
const Group = require('../models/Group');
const RandomRequest = require('../models/RandomRequest');
const crypto = require('crypto');

const NUM_GROUPS = 3; // Number of groups to allocate users into
const NUM_VERIFIERS = 15; // Number of verifiers to select
const NUM_PROVIDERS = 3; // Number of providers to select

// Function to create a seeded random number generator
function seededRandom(seed) {
  const mask = 0xffffffff;
  let m_w = seed;
  let m_z = 888888;
  return function() {
    m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
    m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
    let result = ((m_z << 16) + (m_w & 65535)) >>> 0;
    result /= 4294967296;
    return result;
  };
}

// Function to shuffle an array using a seeded random number generator
const shuffleArray = (array, seed) => {
  const random = seededRandom(seed);
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Function to select users based on Rule A
const selectUsersBasedOnRuleA = async (randomNumber, verifierCount, providerCount) => {
  console.log("-------select users based on Rule A--------------");
  const users = await User.find({});

  const usersWithHashModulo = users.map(user => {
    const hashedAddress = crypto.createHash('sha256').update(user.walletAddress).digest('hex');
    const moduloValue = parseInt(hashedAddress, 16) % randomNumber;
    return { user, moduloValue };
  });

  usersWithHashModulo.sort((a, b) => a.moduloValue - b.moduloValue);

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

// Function to allocate users into groups using Rule B
const allocateUsersIntoGroups = (verifiers, providers, groupCount, randomNumber) => {
  console.log("-------allocate users into groups using Rule B--------------");
  const shuffledVerifiers = shuffleArray(verifiers, randomNumber);
  const shuffledProviders = shuffleArray(providers, randomNumber);

  const groups = Array.from({ length: groupCount }, () => ({ verifiers: [], provider: null }));

  shuffledProviders.forEach((provider, index) => {
    groups[index % groupCount].provider = provider;
  });

  shuffledVerifiers.forEach((verifier, index) => {
    groups[index % groupCount].verifiers.push(verifier);
  });

  return groups;
};

// Main group allocation function
const groupUsers = async (req, res) => {
  console.log("-------allocate group users--------------");
  try {
    // Step 0: Clear all existing groups in the database
    await Group.deleteMany({});

    // Step 1: Read the oldest unused random number from the database
    const randomRequest = await RandomRequest.findOne({ used: false, fulfilled: true }).sort({ timestamp: 1 });
    if (!randomRequest) {
      return res.status(404).json({ error: 'No available random number.' });
    }
    const randomNumber = parseInt(randomRequest.randomNumber, 10);

    // Step 2: Apply Rule A to select users
    const { verifiers, providers } = await selectUsersBasedOnRuleA(randomNumber, NUM_VERIFIERS, NUM_PROVIDERS);

    // Step 3: Apply Rule B to allocate selected users into groups
    const groups = allocateUsersIntoGroups(verifiers, providers, NUM_GROUPS, randomNumber);

    // Step 4: Store the allocated groups into the database
    const groupPromises = groups.map(async (group, index) => {
      const newGroup = new Group({
        groupId: index + 1,
        verifiers: group.verifiers.map(user => user._id),
        provider: group.provider._id
      });
      return newGroup.save();
    });

    await Promise.all(groupPromises);

    // Mark the random number as used
    randomRequest.used = true;
    await randomRequest.save();

    res.status(201).json({ message: 'Groups allocated successfully', groups });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { groupUsers };
