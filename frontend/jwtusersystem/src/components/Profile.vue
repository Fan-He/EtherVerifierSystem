<template>
    <div>
      <h1>Profile</h1>
      <p><strong>Username:</strong> {{ user.username }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        user: {}
      };
    },
    async created() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/auth/profile', {
          headers: { Authorization: token }
        });
        this.user = response.data;
      } catch (error) {
        console.error(error);
        this.$router.push('/login');
      }
    }
  };
  </script>
  
  <style>
  /* Add your styles here */
  </style>
  