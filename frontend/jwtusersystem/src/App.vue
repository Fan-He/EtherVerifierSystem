<template>
  <div id="app">
    <router-link to="/">Home</router-link> |
    <router-link to="/login">Login</router-link> |
    <router-link to="/register">Register</router-link> |
    <router-link to="/profile">Profile</router-link> |
    <router-link to="/send-message">Send Message</router-link> |
    <router-link to="/inbox">Inbox</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
/* Add your styles here */
</style>
