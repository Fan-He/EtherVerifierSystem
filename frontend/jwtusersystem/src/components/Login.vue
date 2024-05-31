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

<!-- <template>
  <div class="login-container">
      <h1>Login</h1>
      <form @submit.prevent="login">
          <div class="form-group">
              <label for="email">Email:</label>
              <input type="email" id="email" v-model="email" required>
          </div>
          <div class="form-group">
              <label for="password">Password:</label>
              <input type="password" id="password" v-model="password" required>
          </div>
          <button type="submit">Login</button>
      </form>
  </div>
</template> -->
  
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
          const token = response.data.token;
          localStorage.setItem('token', token); // Store the token in local storage
          alert('Login successful');
        } catch (error) {
          alert('Error logging in: ' + (error.response ? error.response.data.error : error.message));
        }
      }
    }
  };
  </script>
  
  <style>
  /* Add your styles here */
  </style>
  