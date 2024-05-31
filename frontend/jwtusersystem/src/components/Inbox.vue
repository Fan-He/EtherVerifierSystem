<template>
    <div>
      <h2>Inbox</h2>
      <div v-for="message in messages" :key="message._id">
        <p><strong>From:</strong> {{ message.from.username }}</p>
        <p><strong>Message:</strong> {{ message.decryptedContent }}</p>
        <hr />
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import * as openpgp from 'openpgp';
  
  export default {
    data() {
      return {
        messages: [],
        privateKey: null
      };
    },
    async created() {
      try {
        const token = localStorage.getItem('token');
        const profileResponse = await axios.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const profile = profileResponse.data;
        const privateKey = await openpgp.readPrivateKey({ armoredKey: profile.privateKey });

        // Decode the JWT to extract the passphrase
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        console.log('Decoded Token:', decodedToken); // Log the decoded token
        console.log('tempPassword: ', decodedToken.tempPassword);

        this.passphrase = decodedToken.tempPassword;

        console.log('Undecrypted private key:', privateKey); // Log the undecrypted private key
        const decryptedPrivateKey = privateKey.isDecrypted() ? privateKey : await openpgp.decryptKey({
          privateKey,
          passphrase: decodedToken.tempPassword 
        });
  
        this.privateKey = decryptedPrivateKey;
        console.log('Decrypted Private Key:', this.privateKey); // Log the decrypted private key
  
        const messagesResponse = await axios.get('/api/messages/inbox', {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        const messages = messagesResponse.data;
        for (const message of messages) {
          // message.firstdecryptedContent = await this.decryptMessage(message.content);
          // message.decryptedContent = await this.decryptMessage(message.firstdecryptedContent);
          message.decryptedContent = await this.decryptMessage(message.content);
        }
  
        this.messages = messages;
      } catch (error) {
        console.error('Error fetching messages:', error);
        alert('Error fetching messages: ' + (error.response ? error.response.data.error : error.message));
      }
    },
    methods: {
      async decryptMessage(encryptedMessage) {
        if (!encryptedMessage.startsWith('-----BEGIN PGP MESSAGE-----')) {
          // If the message is not encrypted, return it as is.
          return encryptedMessage;
        }
  
        try {
          console.log('Encrypted Message:', encryptedMessage); // Log the encrypted message
          const message = await openpgp.readMessage({ armoredMessage: encryptedMessage });
          console.log('Read Message:', message); // Log the read message
          console.log('Private Key:', this.privateKey); // Log the private key

          const decryptionResult = await openpgp.decrypt({
            message,
            decryptionKeys: this.privateKey
          });

          console.log('Decryption Result:', decryptionResult); // Log the decryption result
  
          const { data: decryptedMessage } = decryptionResult;
          console.log('Decrypted Message:', decryptedMessage); // Log the decrypted message
          return decryptedMessage;
        } catch (error) {
          console.error('Error decrypting message:', error);
          return 'Error decrypting message';
        }
      }
    }
  };
  </script>
  
  <style>
  /* Add your styles here */
  </style>
  