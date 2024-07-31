import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store'; // Import the Vuex store
import axios from 'axios';

// // Function to connect MetaMask
// async function connectMetaMask() {
//   if (window.ethereum) {
//     try {
//       await window.ethereum.request({ method: 'eth_requestAccounts' });
//       console.log('MetaMask is connected');
//     } catch (error) {
//       console.error('User rejected the request:', error);
//     }
//   } else {
//     console.error('MetaMask is not installed');
//   }
// }

// // Connect MetaMask on initial load
// connectMetaMask();


const serverIp = import.meta.env.VITE_SERVER_IP;

// Create the Vue application
const app = createApp(App);

// Set up the Axios default base URL
// axios.defaults.baseURL = `http://${serverIp}`; // Use your actual server URL
axios.defaults.baseURL = 'http://159.89.117.145';

// Fetch the current user profile if a token exists
const token = localStorage.getItem('token');
if (token) {
  store.commit('setToken', token);
  store.dispatch('fetchUser');
}

// WebSocket client setup
// const socket = new WebSocket(`ws://${serverIp}:5005`); // Use your actual WebSocket server address
// const socket = new WebSocket('ws://159.89.117.145:5005');
const socket = new WebSocket(`ws://${import.meta.env.VITE_SERVER_IP}:5005`);

socket.onmessage = function(event) {
  const message = JSON.parse(event.data);
  if (message.type === 'RANDOM_NUMBER') {
    const randomNumber = message.data;
    store.dispatch('handleNewRandomNumber', randomNumber); // Dispatch Vuex action to handle the new random number
  }
};

// Use router and store in the Vue application
app.use(router);
app.use(store);

// Mount the Vue application
app.mount('#app');
