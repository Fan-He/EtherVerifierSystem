const axios = require('axios');
const User = require('../models/User');

// const axios = require('axios');
// const User = require('../models/User'); 

// const updateUserLocation = async (req, res, next) => {
//   try {
//     const ip = req.ip || req.connection.remoteAddress;
//     const locationResponse = await axios.get(`https://ipinfo.io/${ip}/json?token=e403a15bb3e435`);
//     const { city, region: state, country, loc } = locationResponse.data;
//     const [latitude, longitude] = loc.split(',');

//     if (req.user) {
//       const user = await User.findById(req.user.id);
//       user.city = city;
//       user.state = state;
//       user.country = country;
//       user.latitude = latitude;
//       user.longitude = longitude;
//       user.lastUpdated = Date.now();
//       await user.save();
//     }
//     next();
//   } catch (error) {
//     console.error('Error fetching location:', error);
//     next();
//   }
// };

// module.exports = updateUserLocation;



// const User = require('../models/User');
// const axios = require('axios');

// module.exports = async (req, res, next) => {
//   try {
//     let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//     ip = ip.split(',')[0].trim(); // In case of multiple IPs, take the first one and trim spaces
    

//     // Log the IP address for debugging
//     console.log('User IP:', ip);

//     // Use a fallback IP for testing purposes if the IP is localhost
//     if (ip === '::1' || ip.startsWith('127.0.0.1')) {
//       ip = '8.8.8.8'; // Example fallback IP address
//     }

//     const response = await axios.get(`https://ipinfo.io/${ip}/json?token=e403a15bb3e435`);
//     console.log('IP Geolocation Data:', response.data); // Log the geolocation data
    

//     const { city, region: state, country_name: country } = response.data;
//     console.log(city, state, country);

//     // Update user location based on email
//     const userid = req.user.id;
//     const user = await User.findOne({ _id: userid });
//     if (user) {
//       user.city = city;
//       user.state = state;
//       user.country = country;
//       user.lastUpdated = Date.now();
//       user.ip = ip;
//       await user.save();
//       console.log('User location updated:', user); // Log the updated user document
//     } else {
//       console.log('User not found with email:', req.body.email); // Log if user is not found
//     }

//     next();
//   } catch (error) {
//     console.error('Failed to update user location', error);
//     next();
//   }
// };

const updateUserLocation = async (req, res, next) => {
  console.log('Updating user location...');
  try {
    // console.log('Request:', req);
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = ip.split(',')[0].trim(); // In case of multiple IPs, take the first one and trim spaces
    //ip = "2001:569:7ee1:e200:7983:d2f3:91ac:3349";
    
    // Log the IP address for debugging
    console.log('User IP:', ip);

    if (ip.startsWith('::ffff:')) {
      ip = ip.replace('::ffff:', '');
    }
    
    // Use a fallback IP for testing purposes if the IP is localhost
    if (ip === '::1' || ip.startsWith('127.0.0.1')) {
      ip = '8.8.8.8'; // Example fallback IP address
    }
    
    const locationResponse = await axios.get(`https://ipinfo.io/${ip}/json?token=e403a15bb3e435`);
    const { city, region: state, country, loc } = locationResponse.data;
    
    if (req.user) {
      const user = await User.findById(req.user.id);
      user.city = city;
      user.state = state;
      user.country = country;
      user.lastUpdated = Date.now();
      user.ip = ip;
      await user.save();
      console.log('User location updated:', user); // Log the updated user document
    }
    
    next();
  } catch (error) {
    console.error('Failed to update user location', error);
    next();
  }
};

module.exports = updateUserLocation;



