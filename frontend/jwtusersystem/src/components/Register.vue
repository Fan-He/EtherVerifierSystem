<template>
    <div>
      <h1>Register</h1>
      <form @submit.prevent="register">
        <input v-model="username" placeholder="Username" required />
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Register</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        username: '',
        email: '',
        password: ''
      };
    },
    methods: {
      async register() {
        try {
          await axios.post('/api/auth/register', {
            username: this.username,
            email: this.email,
            password: this.password
          });
          alert('Registration successful');
        } catch (error) {
          alert('Error registering: ' + error.response.data.error);
        }
      }
    }
  };
  </script>
  
  <style>
  /* Add your styles here */
  </style>
  