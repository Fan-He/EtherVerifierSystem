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


// Create the Vue application
const app = createApp(App);

// Set up the Axios default base URL
axios.defaults.baseURL = 'http://167.99.176.190'; // Use your actual server URL

// Fetch the current user profile if a token exists
const token = localStorage.getItem('token');
if (token) {
  store.commit('setToken', token);
  store.dispatch('fetchUser');
}

// WebSocket client setup
const socket = new WebSocket('ws://167.99.176.190:5005'); // Use your actual WebSocket server address

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
