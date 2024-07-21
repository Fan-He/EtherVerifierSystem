<script setup>
import { ref } from "vue";
const active = ref(0);
</script>

<template>
  <div class="whole">
      <nav class="header" @click="$router.push('/')">Decentralized Verification</nav>
      <main>
        <router-view></router-view>
      </main>
      <van-tabbar route>
        <van-tabbar-item to="/profile" icon="user" :active-color="'lightblue'">My Profile</van-tabbar-item>
        <van-tabbar-item to="/" icon="wap-home" :active-color="'lightblue'">HomePage</van-tabbar-item>
        <!-- <van-tabbar-item to="/board" icon="notes" :active-color="'lightblue'">Board</van-tabbar-item> -->
        <van-tabbar-item to="/providers" icon="friends" :active-color="'lightblue'">Providers</van-tabbar-item>
        <van-tabbar-item to="/servers" icon="cluster" :active-color="'lightblue'">Servers</van-tabbar-item>
        <van-tabbar-item to="/map" icon="map-marked" :active-color="'lightblue'">Map</van-tabbar-item>
      </van-tabbar>
  </div>
</template>


<style>

  .header {
      height: 60px;
      background-color: lightblue;
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

