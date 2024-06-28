<template>
  <div>
    <h1>Allocated Groups</h1>
    <button @click="fetchGroups">Fetch Groups</button>
    <div v-if="groups.length > 0">
      <div v-for="group in groups" :key="group.groupId" class="group">
        <h2>Group {{ group.groupId }}</h2>
        <p><strong>Provider:</strong> {{ group.provider.username }}</p>
        <ul>
          <li v-for="verifier in group.verifiers" :key="verifier._id">{{ verifier.username }}</li>
        </ul>
        <p><strong>Random Number Used:</strong> {{ group.randomNumber }}</p>
      </div>
    </div>
    <div v-else>
      <p>No groups allocated yet.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

axios.defaults.timeout = 600000;

export default {
  data() {
    return {
      groups: []
    };
  },
  async mounted() {
    await this.loadCurrentGroups();
  },
  methods: {
    async loadCurrentGroups() {
      try {
        const response = await axios.get('/api/groups/current-groups');
        this.groups = response.data.groups;
      } catch (error) {
        console.error('Error fetching current groups:', error);
      }
    },
    async fetchGroups() {
      try {
        const response = await axios.post('/api/groups/allocate-groups', {}, { timeout: 600000 }); // Set timeout to 10 minutes
        this.groups = response.data.groups;
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    }
  }
};
</script>

<style>
.group {
  border: 1px solid #ccc;
  padding: 1px;
  margin-bottom: 1px;
}
</style>
