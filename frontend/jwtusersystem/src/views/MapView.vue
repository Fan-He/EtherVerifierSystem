<template>
    <div id="map" style="height: 500px;"></div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue'; // Import ref from vue
  import axios from 'axios';
  import * as L from 'leaflet';
  
  export default {
    setup() {
      const users = ref([]); // Define users as a ref
  
      onMounted(async () => {
        try {
          const response = await axios.get('/api/location/users/locations');
          users.value = response.data;
          initMap();
        } catch (error) {
          console.error('Error fetching user locations:', error);
        }
      });
  
      const initMap = () => {
        const map = L.map('map').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);
  
        users.value.forEach(user => {
          const marker = L.marker([user.latitude, user.longitude]).addTo(map);
          marker.bindPopup(`${user.city}, ${user.state} - ${user.count} users`).openPopup();
        });
      };
  
      return {
        users,
      };
    }
  };
  </script>
  
  <style>
  #map {
    height: 100%;
  }
  </style>
  