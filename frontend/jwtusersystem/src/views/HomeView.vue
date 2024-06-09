<style>
.home-view {
  display: flex;
  flex-direction: column;
  height: 80vh;
  margin-top: 20px;
  margin-bottom: 20px;
}

.upper-square,
.lower-square {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 70%;
}

.square-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 200px; /* Updated width to 100px */
  height: 200px; /* Updated height to 100px */
  background-color: lightblue;
  border-radius: 50%;
}

.square-link {
  text-decoration: none;
  color: whitesmoke;
  font-size: 35px;
}


</style>
<template>
  <div class="home-view">
    <p>Your current identity is: {{ identity }}</p>
    <div class="upper-square">
      <div class="square-content">
        <button @click="confirmSwitch('verifier')">Switch to Verifier</button>
      </div>
    </div>
    <div class="lower-square">
      <div class="square-content">
        <button @click="confirmSwitch('provider')">Switch to Provider</button>
      </div>
    </div>
    <div v-if="showPopup" class="popup">
      <p>Are you sure you want to switch to {{ targetIdentity }}?</p>
      <button @click="switchIdentity">Yes</button>
      <button @click="showPopup = false">No</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      identity: '', // Current identity
      showPopup: false, // Control popup visibility
      targetIdentity: '', // Identity to switch to
      user:{}
    };
  },
  created() {
    this.fetchProfile();
  },
  methods: {
    async fetchProfile() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/auth/profile', {
          headers: { Authorization: token }
        });
        this.user = response.data;
        this.identity = response.data.identity;
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    },
    confirmSwitch(identity) {
      if (this.identity !== identity) {
        this.targetIdentity = identity;
        this.showPopup = true;
      }
    },
    async switchIdentity() {
      try {
        const user_token = localStorage.getItem('token');
        const user_response = await axios.get('/api/auth/profile', {
          headers: { Authorization: user_token }
        });
        this.user = user_response.data;
        const token = localStorage.getItem('token');
        const response = await axios.post('/api/auth/switch-identity', 
          { email: this.user.email, newIdentity: this.targetIdentity }, 
          {headers: { Authorization: `Bearer ${token}` }
        });
        this.identity = this.targetIdentity;
        this.showPopup = false;  
        alert(response.data.message);
      } catch (error) {
        console.error('Error switching identity:', error);
      }
    }
  }
};
</script>
