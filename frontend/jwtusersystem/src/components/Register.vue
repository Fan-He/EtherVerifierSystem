  <template>
    <div class="register-container">
      <h1>Register</h1>
      <form @submit.prevent="register" class="register-form">
        <input v-model="username" placeholder="Username" required />
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />
        <select class="select-box" v-model="identity" placeholder="Select Identity" required>
          <option value="" disabled selected>Select Identity</option>
          <option value="verifier">Verifier</option>
          <option value="provider">Provider</option>
          <option value="server">Server</option>
        </select>
        <input v-model="walletAddress" placeholder="Wallet Address (optional)" />
        <button type="submit">Register</button>
      </form>
      <p>Already Have An Account? <router-link to="/login" style="color: blue; text-decoration: underline;">Login!</router-link></p>
    </div>
  </template>

  <script>
  import axios from 'axios';

  export default {
    data() {
      return {
        username: '',
        email: '',
        password: '', 
        walletAddress: ''
      };
    },
    methods: {
      async register() {
        try {
          if (this.walletAddress) {
            await axios.post('/api/auth/register', {
              username: this.username,
              email: this.email,
              password: this.password,
              identity: this.identity, 
              walletAddress: this.walletAddress
            });
          } else {
            await axios.post('/api/auth/register', {
              username: this.username,
              email: this.email,
              identity: this.identity,
              password: this.password
            });
          }
          // await axios.post('/api/auth/register', {
          //   username: this.username,
          //   email: this.email,
          //   password: this.password, 
          //   walletAddress: this.walletAddress
          // });
          alert('Registration successful');
        } catch (error) {
          alert('Error registering: ' + error.response.data.error);
        }
      }
    }
  };
  </script>

<style scoped>
.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
}


.register-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 300px;
  max-width: 90%;
  margin-bottom: 20px;
}

.select-box {
  width: 200px;
}

@media (max-width: 600px) {
  .register-form {
    width: 90%;
  }
}
</style>
  