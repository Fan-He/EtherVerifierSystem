import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

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

createApp(App).use(router).mount('#app');
