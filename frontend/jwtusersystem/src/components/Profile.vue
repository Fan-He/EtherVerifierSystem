
  <template>
    <div class="profile">
      <h1>Profile</h1>
      <div class="profile-info">
        <p><strong>Username:</strong> {{ user.username }}</p>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Wallet Address:</strong> {{ user.walletAddress }}</p>
      </div>
      <p>Change Account? <router-link to="/login" style="color: blue; text-decoration: underline;">Login!</router-link></p>
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

  <style scoped>
  .profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 50vh;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }
  .profile h1 {
    font-size: 24px;
    margin-bottom: 20px;
  }
  .profile-info {
    background-color: #f5f5f5;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
  }
  .profile-info p {
    margin-bottom: 10px;
  }
  </style>
  