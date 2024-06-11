const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.get('/users/locations', async (req, res) => {
  try {
    const locations = await User.aggregate([
      {
        $group: {
          _id: { city: '$city', state: '$state', country: '$country' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          city: '$_id.city',
          state: '$_id.state',
          country: '$_id.country',
          latitude: { $first: '$latitude' },
          longitude: { $first: '$longitude' },
          count: 1
        }
      }
    ]);

    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user locations' });
  }
});

module.exports = router;
