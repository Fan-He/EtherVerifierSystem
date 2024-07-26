<style>
.home-view {
  display: flex;
  flex-direction: column;
  height: 70vh;
  margin-top: 20px;
  margin-bottom: 20px;
}

.upper-square,
.lower-square {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60%;
}

.square-content {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 180px; 
  height: 180px; 
  background-color: lightblue;
  border-radius: 50%
  
  ;
}

.square-link {
  text-decoration: none;
  color: whitesmoke;
  font-size: 35px;
}

.identity-button {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
  color: whitesmoke;
  font-size: 28px;
  width: 80%;
}

.identity-text {
  text-align: center;
  font-size: 18pt;
}

.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: lightgray;
  padding: 20px;
  border-radius: 5px;
}

.popup-text {
  margin-bottom: 10px;
  font-size: 18px;
  text-align: center;
}

.popup-button {
  background-color: lightblue;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 24px;
  border-radius: 5px;
  cursor: pointer;
  outline: none;
  width: 80px;
  margin: 5px;
  
}

.popup-button:hover {
  background-color: lightgreen;
}

.identity-count{
  font-size: 28px;
  color: whitesmoke;
}


</style>


<template>
  <div class="home-view">
    <p class="identity-text">Your identity is: {{ identity }}</p>
    <p class="identity-text">Server IP: {{ serverIp }}</p>
    <div class="upper-square">
      <div class="square-content">
        <p class="identity-count">Providers: {{ providerCount }}</p>
      </div>
    </div>
    <div class="lower-square">
      <div class="square-content">
        <p class="identity-count">Verifiers: {{ verifierCount }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      user: {},
      providerCount: 0,
      verifierCount: 0,
      serverIp: import.meta.env.VITE_SERVER_IP
    };
  },
  async created() {
    try {
      const userResponse = await axios.get('/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      this.user = userResponse.data;
      this.identity = userResponse.data.identity;

      const countsResponse = await axios.get('/api/auth/identity-counts', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      this.providerCount = countsResponse.data.providerCount;
      this.verifierCount = countsResponse.data.verifierCount;
    } catch (error) {
      console.error(error);
      alert("Please Login");
      this.$router.push('/login');
    }
  }
};
</script>



<!-- <template>
  <div class="home-view">
    <p class="identity-text">Your current identity is: {{ identity }}</p>
    <div class="upper-square">
      <div class="square-content">
        <button class="identity-button" @click="confirmSwitch('verifier')">Switch to Verifier</button>
      </div>
    </div>
    <div class="lower-square">
      <div class="square-content">
        <button class="identity-button" @click="confirmSwitch('provider')">Switch to Provider</button>
      </div>
    </div>
    <div v-if="showPopup" class="popup">
      <p  class="popup-text">Are you sure you want to switch to {{ targetIdentity }}?</p>
      <button class="popup-button" @click="switchIdentity">Yes</button>
      <button class="popup-button" @click="showPopup = false">No</button>
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
</script> -->
