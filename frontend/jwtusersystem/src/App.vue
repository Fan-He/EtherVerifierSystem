<!-- <template>
  <div id="app">
    <router-link to="/">Home</router-link> |
    <router-link to="/login">Login</router-link> |
    <router-link to="/register">Register</router-link> |
    <router-link to="/profile">Profile</router-link> |
    <router-link to="/send-message">Send Message</router-link> |
    <router-link to="/inbox">Inbox</router-link>
    <router-view></router-view>
  </div>
</template> -->

<script setup>
import { ref } from "vue";
const active = ref(0);
</script>

<template>
  <div class="whole">
      <nav class="header" @click="$router.push('/')">Ether Verifier</nav>
      <main>
        <router-view></router-view>
      </main>
      <van-tabbar  route>
        <van-tabbar-item to="/profile" icon="user">My Profile</van-tabbar-item>
        <van-tabbar-item to="/" icon="wap-home">HomePage</van-tabbar-item>
        <van-tabbar-item to="/board" icon="notes">Board</van-tabbar-item>
      </van-tabbar>
  </div>
</template>

<!-- <style lang="less" scoped>
@import url('https://fonts.googleapis.com/css?family=Poppins');

</style> -->

<style>

  .header {
      height: 60px;
      background-color: #a3d6d5;
      color: white;
      text-align: center;
      line-height: 60px;
      font-size: xx-large;
    }
    
    html, body {
      margin: 0;
      padding: 0;
      overflow: hidden;
    }

  .nav {
      background-color: whitesmoke;
      div {
          color: white
      }
  }

  .whole {
      background-color: whitesmoke;
      height: 100vh;
      font-family: 'Poppins';
  }
</style>

