<template>
    <div>
      <h2>Send Message</h2>
      <form @submit.prevent="sendMessage">
        <input v-model="recipient" placeholder="Recipient Email" required />
        <textarea v-model="message" placeholder="Message" required></textarea>
        <button type="submit">Send</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import * as openpgp from 'openpgp';
  
  export default {
    data() {
      return {
        recipient: '',
        message: ''
      };
    },
    methods: {
      async sendMessage() {
        try {
          const token = localStorage.getItem('token'); // Get the token from local storage
          const response = await axios.get(`/api/auth/profile/email/${this.recipient}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
  
          if (!response.data || !response.data.publicKey) {
            throw new Error('Invalid recipient publicKey');
          }
  
          console.log('Recipient data:', response.data); // Log recipient data
  
          const recipient = response.data;
          let publicKey;
          try {
            publicKey = await openpgp.readKey({ armoredKey: recipient.publicKey });
            console.log('PublicKey:', publicKey); // Log the result of readKey
          } catch (err) {
            console.error('Error reading public key:', err);
            throw new Error('Error reading public key');
          }
  
          if (!publicKey) {
            console.error('Invalid public key:', publicKey);
            throw new Error('Invalid public key');
          }
  
          console.log('PublicKey for Encryption:', publicKey); // Log the specific key used for encryption
  
          let encryptedMessage;
          try {
            encryptedMessage = await openpgp.encrypt({
              message: await openpgp.createMessage({ text: this.message }),
              encryptionKeys: publicKey
            });
            console.log('Encrypted message:', encryptedMessage); // Log the encrypted message
          } catch (err) {
            console.error('Error encrypting message:', err);
            throw new Error('Error encrypting message');
          }
  
          await axios.post('/api/messages/send', {
            to: this.recipient,
            content: encryptedMessage
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
  
          alert('Message sent successfully');
          this.recipient = '';
          this.message = '';
        } catch (error) {
          console.error('Error sending message:', error.response ? error.response.data : error.message); // Improved error logging
          alert('Error sending message: ' + (error.response ? error.response.data.error : error.message));
        }
      }
    }
  };
  </script>
  
  <style>
  /* Add your styles here */
  </style>
  