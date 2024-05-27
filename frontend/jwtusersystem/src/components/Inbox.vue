<template>
    <div>
      <h2>Inbox</h2>
      <div v-for="message in messages" :key="message._id">
        <p><strong>From:</strong> {{ message.from.username }}</p>
        <p><strong>Message:</strong> {{ message.content }}</p>
        <hr />
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        messages: []
      };
    },
    async created() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/messages/inbox', {
          headers: { Authorization: `Bearer ${token}` }
        });
  
        this.messages = response.data;
      } catch (error) {
        console.error('Error fetching messages:', error);
        alert('Error fetching messages: ' + (error.response ? error.response.data.error : error.message));
      }
    }
  };
  </script>
  
  <style>
  /* Add your styles here */
  </style>
  