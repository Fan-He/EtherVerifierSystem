<template>
    <div>
      <h1>Debugging Page</h1>
      <p>{{ token }}</p>
      <div>
        <h2>Current User</h2>
        <p>Username: {{ user?.username }}</p>
        <p>Is Leader: {{ isLeader ? 'Yes' : 'No' }}</p>
      </div>
      <div>
        <h2>User Group</h2>
        <div>
          <h3>Verifiers:</h3>
          <ul>
            <li v-for="verifier in userGroup?.verifiers" :key="verifier._id">{{ verifier.username }}</li>
          </ul>
        </div>
        <div>
          <h3>Provider:</h3>
          <p>{{ userGroup?.provider.username }}</p>
        </div>
        <div>
          <h3>Leader:</h3>
          <p>{{ userGroup?.leader.username }}</p>
        </div>
      </div>
      <div>
        <h2>Group Members Online Status</h2>
        <ul>
          <li v-for="(online, memberId) in groupMembersOnlineStatus" :key="memberId">
            {{ findUsernameById(memberId) }} - {{ online ? 'Online' : 'Offline' }}
          </li>
        </ul>
      </div>
    </div>
  </template>
  
  <script>
  import { mapState } from 'vuex';
  
  export default {
    computed: {
      ...mapState(['token', 'user', 'randomNumber', 'userGroup', 'isLeader', 'groupMembersOnlineStatus']),
      findUsernameById() {
        return (id) => {
          const member = this.userGroupMembers.find(member => member._id === id);
          return member ? member.username : 'Unknown';
        };
      }
    }
  }
  </script>
  