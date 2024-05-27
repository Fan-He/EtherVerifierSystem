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
          await axios.post('/api/messages/send', {
            to: this.recipient,
            content: this.message
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
  
          alert('Message sent successfully');
          this.recipient = '';
          this.message = '';
        } catch (error) {
          console.error('Error sending message:', error);
          alert('Error sending message: ' + (error.response ? error.response.data.error : error.message));
        }
      }
    }
  };
  </script>
  
  <style>
  /* Add your styles here */
  </style>
  