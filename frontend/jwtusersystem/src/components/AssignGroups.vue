<template>
  <div class="assign-groups">
    <h1>Assign Groups</h1>
    <button @click="assignGroups">Form Group</button>
    <div v-if="groups.length">
      <h2>Groups</h2>
      <ul>
        <li v-for="group in groups" :key="group.groupId">
          Group {{ group.groupId }}: Providers: {{ group.providers.join(', ') }} Verifiers: {{ group.verifiers.join(', ') }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Web3 from 'web3';

export default {
  data() {
    return {
      groups: []
    };
  },
  methods: {
    async assignGroups() {
      try {
        const web3 = await checkMetamaskConnection();
        if (!web3) return;

        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];
        console.log("account is: ", account);

        // Call the backend to request random number
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/auth/allocate', {
          headers: { Authorization: `Bearer ${token}` },
          from: account
        });
        
        if (response.status === 200) {
          this.groups = response.data;
        } else {
          console.error('Error:', response.data);
        }
      } catch (error) {
        console.error('Error assigning groups:', error);
      }
    }
  }
};

const checkMetamaskConnection = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) {
        alert('Please connect to Metamask.');
      }
      return web3;
    } catch (error) {
      console.error('User denied account access', error);
      alert('Please connect to Metamask.');
    }
  } else {
    alert('Please install Metamask!');
  }
  return null;
};
</script>

<style scoped>
.assign-groups {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.assign-groups h1 {
  font-size: 24px;
  margin-bottom: 20px;
}
.assign-groups button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>
