// backend/routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const { groupUsers } = require('../controllers/groupController');
const Group = require('../models/Group');

router.post('/allocate-groups', groupUsers);

router.get('/current-groups', async (req, res) => {
    try {
      const groups = await Group.find({}).populate('verifiers provider');
      res.status(200).json({ groups });
    } catch (error) {
      console.error('Error fetching current groups in route:', error); // Log the error
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
