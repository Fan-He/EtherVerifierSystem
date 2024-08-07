import { createApp } from 'vue';
import { createStore } from 'vuex';
import axios from 'axios';
import CryptoJS from 'crypto-js';

const store = createStore({
  state: {
    token: localStorage.getItem('token') || '',
    user: null,
    randomNumber: null,
    userGroup: null,
    userGroupMembers: [],
    isLeader: false,
    groupMembersOnlineStatus: {},
    transactionData: null, // New state property for transaction data
  },
  mutations: {
    setToken(state, token) {
      console.log('Mutation: setToken', token);
      state.token = token;
    },
    setUser(state, user) {
      console.log('Mutation: setUser', user);
      state.user = user;
    },
    setRandomNumber(state, randomNumber) {
      console.log('Mutation: setRandomNumber', randomNumber);
      state.randomNumber = randomNumber;
    },
    setUserGroup(state, group) {
      console.log('Mutation: setUserGroup', group);
      state.userGroup = group;
    },
    setUserGroupMembers(state, members) {
      console.log('Mutation: setUserGroupMembers', members);
      state.userGroupMembers = members;
    },
    setIsLeader(state, isLeader) {
      console.log('Mutation: setIsLeader', isLeader);
      state.isLeader = isLeader;
    },
    setGroupMembersOnlineStatus(state, status) {
      console.log('Mutation: setGroupMembersOnlineStatus', status);
      state.groupMembersOnlineStatus = status;
    },
    setTransactionData(state, transactionData) {
      console.log('Mutation: setTransactionData', transactionData);
      state.transactionData = transactionData;
    },
  },
  actions: {
    async fetchUser({ commit, state }) {
      if (state.token) {
        try {
          const response = await axios.get('/api/auth/profile', {
            headers: { Authorization: `Bearer ${state.token}` }
          });
          console.log('Action: fetchUser', response.data);
          commit('setUser', response.data);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          commit('setUser', null);
        }
      }
    },
    handleNewRandomNumber({ commit, dispatch }, randomNumber) {
      console.log('Action: handleNewRandomNumber', randomNumber);
      commit('setRandomNumber', randomNumber);
      dispatch('performGroupAllocation', randomNumber);
      dispatch('waitAndCheckInbox');
    },
    async performGroupAllocation({ commit, dispatch, state }, randomNumber) {
      console.log('Action: performGroupAllocation', randomNumber);
      try {
        const usersResponse = await axios.get('/api/auth/users', {
          headers: { Authorization: `Bearer ${state.token}` }
        });
        const users = usersResponse.data;

        const groups = performLocalGroupAllocation(users, randomNumber);
        const userGroup = findUserGroup(groups, state.user);
        console.log('Groups:', groups);
        console.log('User Group:', userGroup);
        commit('setUserGroup', userGroup);
        commit('setUserGroupMembers', userGroup ? userGroup.verifiers.concat(userGroup.provider) : []);
        commit('setIsLeader', userGroup ? checkIfUserIsLeader(userGroup, state.user) : false);

        if (userGroup) {
          dispatch('shareRandomNumberWithGroup', state.randomNumber);
        }
      } catch (error) {
        console.error('Failed to perform group allocation:', error);
      }
    },
    async shareRandomNumberWithGroup({ state }) {
      console.log('Action: shareRandomNumberWithGroup');
      const { randomNumber, user, userGroupMembers } = state;
      const ipAddress = await getUserIpAddress();
      for (const member of userGroupMembers) {
        const personalHash = generatePersonalHash(randomNumber, user.walletAddress, ipAddress);
        await sendMessageToMember(member.email, personalHash);
      }
    },
    async waitAndCheckInbox({ dispatch }) {
      console.log('Action: waitAndCheckInbox');
      await new Promise(resolve => setTimeout(resolve, 5000));
      dispatch('checkInboxForOnlineStatus');
    },
    async checkInboxForOnlineStatus({ commit, state }) {
      console.log('Action: checkInboxForOnlineStatus');
      try {
        const response = await axios.get('/api/messages/inbox', {
          headers: { Authorization: `Bearer ${state.token}` }
        });
        const messages = response.data;
        const onlineStatus = {};

        for (const member of state.userGroupMembers) {
          onlineStatus[member._id] = messages.some(message => message.from._id === member._id);
        }

        console.log('Updated Online Status:', onlineStatus);
        commit('setGroupMembersOnlineStatus', onlineStatus);

        const newLeader = await reselectLeaderIfNeeded({ commit, state });
        if (newLeader) {
          commit('setIsLeader', newLeader._id === state.user._id);
          commit('setUserGroup', { ...state.userGroup, leader: newLeader });
          if (newLeader._id === state.user._id) {
            leaderActions({ commit, state });
          }
        }
      } catch (error) {
        console.error('Failed to check inbox for online status:', error);
      }
    },
    async requestTransactionSignature({ commit, state }, transactionData) {
      console.log('Action: requestTransactionSignature', transactionData);
      commit('setTransactionData', transactionData);
      try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        const signedTx = await ethereum.request({
          method: 'eth_signTransaction',
          params: [
            {
              from: account,
              to: transactionData.to,
              value: transactionData.value,
              gas: transactionData.gas,
              data: transactionData.data,
            },
          ],
        });
        console.log('Signed Transaction:', signedTx);
        return signedTx;
      } catch (error) {
        console.error('Failed to sign transaction:', error);
        throw error;
      }
    },
  },
  modules: {},
});

function performLocalGroupAllocation(users, randomNumber) {
  console.log('Function: performLocalGroupAllocation', randomNumber);
  // Implement the group allocation logic based on randomNumber
  const usersWithHashModulo = users.map(user => {
    const hashedAddress = CryptoJS.SHA256(user.walletAddress).toString(CryptoJS.enc.Hex);
    const moduloValue = BigInt(`0x${hashedAddress}`) % BigInt(randomNumber);
    return { user, moduloValue };
  });

  usersWithHashModulo.sort((a, b) => (a.moduloValue < b.moduloValue ? -1 : 1));

  const verifiers = usersWithHashModulo
    .filter(({ user }) => user.identity === 'verifier')
    .slice(0, 15) // Adjust the number of verifiers as needed
    .map(({ user }) => user);

  const providers = usersWithHashModulo
    .filter(({ user }) => user.identity === 'provider')
    .slice(0, 3) // Adjust the number of providers as needed
    .map(({ user }) => user);

  const sortedVerifiers = sortUsersDeterministically(verifiers, randomNumber);
  const sortedProviders = sortUsersDeterministically(providers, randomNumber);

  return allocateUsersIntoGroupsDeterministically(sortedVerifiers, sortedProviders, 3, randomNumber); // Adjust the number of groups as needed
}

function sortUsersDeterministically(users, randomNumber) {
  console.log('Function: sortUsersDeterministically', randomNumber);
  return users.sort((a, b) => {
    const hashA = CryptoJS.SHA256(a.walletAddress + randomNumber).toString(CryptoJS.enc.Hex);
    const hashB = CryptoJS.SHA256(b.walletAddress + randomNumber).toString(CryptoJS.enc.Hex);
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
}

function allocateUsersIntoGroupsDeterministically(verifiers, providers, groupCount, randomNumber) {
  console.log('Function: allocateUsersIntoGroupsDeterministically', randomNumber);
  const groups = Array.from({ length: groupCount }, () => ({ verifiers: [], provider: null, leader: null }));

  providers.forEach((provider, index) => {
    groups[index % groupCount].provider = provider;
  });

  verifiers.forEach((verifier, index) => {
    groups[index % groupCount].verifiers.push(verifier);
  });

  groups.forEach(group => {
    group.leader = group.verifiers.reduce((max, verifier) => {
      const verifierHash = CryptoJS.SHA256(verifier.walletAddress + randomNumber).toString(CryptoJS.enc.Hex);
      const maxHash = CryptoJS.SHA256(max.walletAddress + randomNumber).toString(CryptoJS.enc.Hex);
      return BigInt(`0x${verifierHash}`) > BigInt(`0x${maxHash}`) ? verifier : max;
    }, group.verifiers[0]);
  });

  return groups;
}

function findUserGroup(groups, currentUser) {
  console.log('Function: findUserGroup', currentUser);
  return groups.find(group => group.verifiers.some(verifier => verifier._id === currentUser._id) || group.provider._id === currentUser._id);
}

function checkIfUserIsLeader(group, currentUser) {
  console.log('Function: checkIfUserIsLeader', currentUser);
  return group.leader._id === currentUser._id;
}

async function sendMessageToMember(memberEmail, randomNumber) {
  console.log('Function: sendMessageToMember', memberEmail, randomNumber);
  try {
    const response = await axios.post('/api/messages/send', {
      to: memberEmail,
      content: randomNumber.toString()
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    console.log('Message sent to member:', response.data);
  } catch (error) {
    console.error('Failed to send message to member:', error);
  }
}

async function reselectLeaderIfNeeded({ commit, state }) {
  console.log('Function: reselectLeaderIfNeeded', state);
  const group = state.userGroup;
  console.log("group id is: ", group);
  const onlineVerifiers = group.verifiers.filter(verifier => state.groupMembersOnlineStatus[verifier._id]);

  if (onlineVerifiers.length > 0) {
    const newLeader =  onlineVerifiers.reduce((max, verifier) => {
      const verifierHash = CryptoJS.SHA256(verifier.walletAddress + state.randomNumber).toString(CryptoJS.enc.Hex);
      const maxHash = CryptoJS.SHA256(max.walletAddress + state.randomNumber).toString(CryptoJS.enc.Hex);
      return BigInt(`0x${verifierHash}`) > BigInt(`0x${maxHash}`) ? verifier : max;
    }, onlineVerifiers[0]);

    if (newLeader._id !== group.leader._id) {
      console.log('Updating Leader in DB for New Leader ID:', newLeader._id);
      await updateLeaderInDB(newLeader._id, state.token);
        // .then(() => {
        //   commit('setIsLeader', newLeader._id === state.user._id);
        //   commit('setUserGroup', { ...group, leader: newLeader });
        // })
        // .catch(error => {
        //   console.error('Failed to update leader in state:', error);
        // });
    }
    return newLeader;
  } else {
    return null;
  }
}

async function updateLeaderInDB(newLeaderId, token) {
  try {
    console.log("UPDATE LEADER IN DB");
    await axios.put(`/api/groups/update-leader`, { newLeaderId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Leader updated in database-----------------');
  } catch (error) {
    console.error('Failed to update leader in database:', error);
    throw error;
  }
}



async function leaderActions({ commit, state }) {
  console.log('Function: leaderActions', state);
  try {
    const response = await axios.post('/api/groups/generate-group-hash', null, {
      headers: { Authorization: `Bearer ${state.token}` }
    });
    commit('setGroupHash', response.data.groupHash);
  } catch (error) {
    console.error('Failed to generate group hash:', error);
  }
}


function generatePersonalHash(randomNumber, walletAddress, ipAddress) {
  const timestamp = new Date().toISOString();
  const dataToHash = `${randomNumber}-${walletAddress}-${timestamp}-${ipAddress}`;
  const hash = CryptoJS.SHA256(dataToHash).toString(CryptoJS.enc.Hex);
  return hash;
}

async function getUserIpAddress() {
  const response = await axios.get('https://api.ipify.org?format=json');
  console.log("User IP Address: ", response.data.ip);
  return response.data.ip;
}

export default store;
