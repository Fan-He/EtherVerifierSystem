<!-- <template>
  <div id="map" style="height: 500px;"></div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default {
  setup() {
    const users = ref([]);
    const map = ref(null);

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
      map.value = L.map('map').setView([20, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.value);

      users.value.forEach(user => {
        // Geocode the city and state to get the latitude and longitude
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${user.city},${user.state}`;
        axios.get(geocodeUrl).then(response => {
          if (response.data.length > 0) {
            const { lat, lon } = response.data[0];
            const marker = L.marker([lat, lon]).addTo(map.value);
            marker.bindPopup(`${user.city}, ${user.state} - ${user.count} users`).openPopup();
          }
        }).catch(error => {
          console.error('Error geocoding location:', error);
        });
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
</style> -->
<template>
  <div id="map" style="height: 85vh; width: 100vw;"></div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for broken marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default {
  setup() {
    const users = ref([]);
    const map = ref(null);

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
      map.value = L.map('map').setView([20, 0], 2);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map.value);

      users.value.forEach(user => {
        // Geocode the city and state to get the latitude and longitude
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${user.city},${user.state}`;
        axios.get(geocodeUrl).then(response => {
          if (response.data.length > 0) {
            const { lat, lon } = response.data[0];
            const marker = L.marker([lat, lon]).addTo(map.value);
            marker.bindPopup(`${user.city}, ${user.state} - ${user.count} users`).openPopup();
          }
        }).catch(error => {
          console.error('Error geocoding location:', error);
        });
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
