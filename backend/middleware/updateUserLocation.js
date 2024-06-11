const axios = require('axios');
const User = require('../models/User'); 

const updateUserLocation = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const locationResponse = await axios.get(`https://ipinfo.io/${ip}/json?token=e403a15bb3e435`);
    const { city, region: state, country, loc } = locationResponse.data;
    const [latitude, longitude] = loc.split(',');

    if (req.user) {
      const user = await User.findById(req.user.id);
      user.city = city;
      user.state = state;
      user.country = country;
      user.latitude = latitude;
      user.longitude = longitude;
      user.lastUpdated = Date.now();
      await user.save();
    }
    next();
  } catch (error) {
    console.error('Error fetching location:', error);
    next();
  }
};

module.exports = updateUserLocation;
