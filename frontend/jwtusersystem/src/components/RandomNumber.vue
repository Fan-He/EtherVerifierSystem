<template>
  <div>
    <p v-if="randomNumber !== null">Oldest Unused Random Number: {{ randomNumber }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      randomNumber: null,
    };
  },
  methods: {
    async fetchOldestUnusedRandomNumber() {
      try {
        const response = await axios.get('/api/randomNumber/oldest-unused-random-number');
        this.randomNumber = response.data.randomNumber;
      } catch (error) {
        console.error(error);
      }
    }
  },
  mounted() {
    this.fetchOldestUnusedRandomNumber();
    setInterval(this.fetchOldestUnusedRandomNumber, 60000); // Refresh every minute
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>
