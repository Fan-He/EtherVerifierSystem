<!-- <template>
    <div>
      <h1>Login</h1>
      <form @submit.prevent="login">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <button type="submit">Login</button>
      </form>
    </div>
    <p>No Account? <router-link to="/register" style="color: blue; text-decoration: underline;">Register!</router-link></p>
</template>  -->
<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="login" class="login-form">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p>No Account? <router-link to="/register" style="color: blue; text-decoration: underline;">Register!</router-link></p>
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

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
}


.login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 300px;
  max-width: 90%;
  margin-bottom: 20px;
}

@media (max-width: 600px) {
  .login-form {
    width: 90%;
  }
}
</style>

  
  <!-- <script>
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
  </style> -->
  