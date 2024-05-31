<template>
  <div>
    <h2>Send Message</h2>
    <form @submit.prevent="sendMessage">
      <div>
        <label for="recipient">To (email):</label>
        <input v-model="recipient" id="recipient" required />
      </div>
      <div>
        <label for="content">Message:</label>
        <textarea v-model="content" id="content" required></textarea>
      </div>
      <button type="submit">Send</button>
    </form>
    <p v-if="errorMessage" style="color: red">{{ errorMessage }}</p>
    <p v-if="successMessage" style="color: green">{{ successMessage }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      recipient: '',
      content: '',
      errorMessage: '',
      successMessage: ''
    };
  },
  methods: {
    async sendMessage() {
      this.errorMessage = '';
      this.successMessage = '';

      try {
        const token = localStorage.getItem('token');
        await axios.post('/api/messages/send', {
          to: this.recipient,
          content: this.content
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.successMessage = 'Message sent successfully';
        this.recipient = '';
        this.content = '';
      } catch (error) {
        this.errorMessage = error.response ? error.response.data.message : error.message;
      }
    }
  }
};
</script>

<style>
/* Add your styles here */
</style>
