<template>
    <div class="servers-container">
      <h1>Servers</h1>
      <div class="server-list-container">
        <ul class="server-list">
          <li v-for="server in servers" :key="server.walletAddress" class="server-item">
            <div class="server-info">
              <span class="server-username">{{ server.username }}</span>
              <span class="server-ip">{{ server.ip }}</span>
              <a :href="`https://sepolia.etherscan.io/address/${server.walletAddress}`" target="_blank" class="server-link">
                {{ server.walletAddress }}
              </a>
            </div>
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
        servers: []
      };
    },
    created() {
      this.fetchservers();
    },
    methods: {
      async fetchservers() {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('/api/auth/servers', {
            headers: { Authorization: `Bearer ${token}` }
          });
          this.servers = response.data;
        } catch (error) {
          console.error('Failed to fetch servers:', error);
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .servers-container {
    width: 60%;
    max-width: 400px;
    height: 80vh; /* 80% of the viewport height */
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
  
  .server-list-container {
    width: 100%;
    height: calc(80vh - 80px); /* 80% of the viewport height minus some space for padding and title */
    overflow-y: auto;
    padding-right: 10px; /* Add some padding for scrollbar visibility */
  }
  
  .server-list {
    list-style-type: none;
    padding: 0;
    width: 100%;
    border-top: 1px solid #e0e0e0; /* Add a border on top of the list */
  }
  
  .server-item {
    margin: 10px 0;
    padding: 10px 0;
    border-bottom: 1px solid #e0e0e0; /* Add a thin line between each item */
  }
  
  .server-info {
    display: flex;
    flex-direction: column;
  }
  
  .server-username {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .server-link {
    color: rgb(91, 162, 185);
    text-decoration: none;
    font-weight: bold;
    font-size: 16px; /* Increase the font size */
  }
  
  .server-link:hover {
    text-decoration: underline;
    color: #0056b3; /* Change the color on hover */
  }
  
  /* Custom scrollbar styling */
  .server-list-container::-webkit-scrollbar {
    width: 8px;
  }
  
  .server-list-container::-webkit-scrollbar-thumb {
    background-color: lightblue;
    border-radius: 4px;
  }
  
  .server-list-container::-webkit-scrollbar-track {
    background-color: #f1f1f1;
    border-radius: 4px;
  }
  </style>
  