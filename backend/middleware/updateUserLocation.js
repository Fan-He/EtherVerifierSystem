const axios = require('axios');
const User = require('../models/User');

// const updateUserLocation = async (req, res, next) => {
//   console.log('Updating user location...');
//   try {
//     // console.log('Request:', req);
//     let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//     ip = ip.split(',')[0].trim(); // In case of multiple IPs, take the first one and trim spaces
//     //ip = "2001:569:7ee1:e200:7983:d2f3:91ac:3349";
    
//     // Log the IP address for debugging
//     console.log('User IP:', ip);

//     if (ip.startsWith('::ffff:')) {
//       ip = ip.replace('::ffff:', '');
//     }
    
//     // Use a fallback IP for testing purposes if the IP is localhost
//     if (ip === '::1' || ip.startsWith('127.0.0.1')) {
//       ip = '8.8.8.8'; // Example fallback IP address
//     }
    
//     const locationResponse = await axios.get(`https://ipinfo.io/${ip}/json?token=e403a15bb3e435`);
//     const { city, region: state, country, loc } = locationResponse.data;
    
//     if (req.user) {
//       const user = await User.findById(req.user.id);
//       user.city = city;
//       user.state = state;
//       user.country = country;
//       user.lastUpdated = Date.now();
//       user.ip = ip;
//       await user.save();
//       console.log('User location updated:', user); // Log the updated user document
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
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    ip = ip.split(',')[0].trim(); // In case of multiple IPs, take the first one and trim spaces

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
    const { city, region: state, country } = locationResponse.data;

    if (!ip || !city || !state || !country) {
      console.log('No IP or location information found or information is incomplete.');
      return next();
    }

    if (req.user) {
      const user = await User.findById(req.user.id);
      const isLocationChanged = user.city !== city || user.state !== state || user.country !== country;
      const isIpChanged = user.ip !== ip;

      if (isLocationChanged || isIpChanged) {
        user.city = city;
        user.state = state;
        user.country = country;
        user.ip = ip;
        user.lastUpdated = Date.now();
        await user.save();
        console.log('User location updated:', user);
      } else {
        console.log('Location and IP information has not changed.');
      }
    }

    next();
  } catch (error) {
    console.error('Failed to update user location', error);
    next();
  }
};


module.exports = updateUserLocation;



