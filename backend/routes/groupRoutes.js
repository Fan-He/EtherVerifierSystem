// backend/routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const { groupUsers } = require('../controllers/groupController');
const Group = require('../models/Group');

// Route to allocate groups
router.post('/allocate-groups', groupUsers);

// Route to get current groups
router.get('/current-groups', async (req, res) => {
  try {
    const groups = await Group.find({}).populate('verifiers provider leader');
    res.status(200).json({ groups });
  } catch (error) {
    console.error('Error fetching current groups:', error); // Log the error
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
