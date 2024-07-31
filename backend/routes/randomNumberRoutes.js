// backend/routes/randomNumberRoutes.js
const express = require('express');
const router = express.Router();
const RandomRequest = require('../models/RandomRequest');

router.get('/oldest-unused-random-number', async (req, res) => {
  try {
    const oldestUnused = await RandomRequest.findOne({ used: false }).sort({ timestamp: 1 });
    res.json({ randomNumber: oldestUnused ? oldestUnused.randomNumber : null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
