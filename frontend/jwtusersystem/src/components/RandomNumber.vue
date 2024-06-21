<template>
  <div>
    <button @click="generateRandomNumber">Generate Random Number</button>
    <p v-if="txHash">Transaction Hash: {{ txHash }}</p>
    <p v-if="randomNumber !== null">Random Number: {{ randomNumber }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import Web3 from 'web3';
import { mapGetters } from 'vuex';

export default {
  data() {
    return {
      txHash: '',
      randomNumber: null,
    };
  },
  computed: {
    ...mapGetters(['authToken'])
  },
  methods: {
    async generateRandomNumber() {
      const web3 = await this.checkMetamaskConnection();
      if (!web3) return;

      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      console.log("Connected account is:", account);

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post('/api/auth/request-random-number', {
          account: account
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.txHash = response.data.txHash;
        this.checkFulfillmentStatus();
      } catch (error) {
        console.error(error);
      }
    },
    async checkFulfillmentStatus() {
      setInterval(async () => {
        try {
          const token = localStorage.getItem('token');
          await axios.get('/api/auth/check-request-fulfillment', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const response = await axios.get('/api/auth/latest-random-number', {
            headers: { Authorization: `Bearer ${token}` }
          });
          this.randomNumber = response.data.randomNumber;
        } catch (error) {
          console.error(error);
        }
      }, 30000); // Check every 30 seconds
    },
    async checkMetamaskConnection() {
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
    }
  },
  mounted() {
    this.checkFulfillmentStatus(); // Automatically check fulfillment status on mount
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>
