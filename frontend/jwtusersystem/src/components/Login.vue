<template>
    <div>
      <h1>Login</h1>
      <form @submit.prevent="login">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        email: '',
        password: ''
      };
    },
    methods: {
      async login() {
        try {
          const response = await axios.post('/api/auth/login', {
            email: this.email,
            password: this.password
          });
          localStorage.setItem('token', response.data.token);
          alert('Login successful');
        } catch (error) {
          alert('Error logging in: ' + error.response.data.error);
        }
      }
    }
  };
  </script>
  
  <style>
  /* Add your styles here */
  </style>
  