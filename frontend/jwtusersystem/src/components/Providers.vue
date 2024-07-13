<template>
    <div class="providers-container">
      <h1>Providers</h1>
      <div class="provider-list-container">
        <ul class="provider-list">
          <li v-for="provider in providers" :key="provider.walletAddress" class="provider-item">
            <a :href="`https://sepolia.etherscan.io/address/${provider.walletAddress}`" target="_blank" class="provider-link">
              {{ provider.walletAddress }}
            </a>
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        providers: []
      };
    },
    created() {
      this.fetchProviders();
    },
    methods: {
      async fetchProviders() {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/auth/providers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            this.providers = response.data;
        } catch (error) {
          console.error('Failed to fetch providers:', error);
        }
      }
    }
  };
  </script>


<style scoped>
.providers-container {
  width: 60%;
  height: 70vh; /* 80% of the viewport height */
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 20px;
}

.provider-list-container {
  width: 100%;
  height: calc(80vh - 80px); /* 80% of the viewport height minus some space for padding and title */
  overflow-y: auto;
  padding-right: 10px; /* Add some padding for scrollbar visibility */
}

.provider-list {
  list-style-type: none;
  padding: 0;
  width: 100%;
  border-top: 1px solid #e0e0e0; /* Add a border on top of the list */
}

.provider-item {
  margin: 10px 0;
  padding: 10px 0;
  border-bottom: 1px solid #e0e0e0; /* Add a thin line between each item */
}

.provider-link {
  color: rgb(91, 162, 185);
  text-decoration: none;
  font-weight: bold;
  font-size: 16px; /* Increase the font size */
}

.provider-link:hover {
  text-decoration: underline;
  color: #0056b3; /* Change the color on hover */
}

/* Custom scrollbar styling */
.provider-list-container::-webkit-scrollbar {
  width: 8px;
}

.provider-list-container::-webkit-scrollbar-thumb {
  background-color: lightblue;
  border-radius: 4px;
}

.provider-list-container::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 4px;
}
</style>
  