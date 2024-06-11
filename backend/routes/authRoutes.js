const express = require('express');
const { register, login, getProfile, getUserProfileByEmail, switchIdentity } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const updateUserLocation = require('../middleware/updateUserLocation');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, updateUserLocation, getProfile);
router.get('/profile/email/:email', authMiddleware, updateUserLocation, getUserProfileByEmail);
router.post('/switch-identity', authMiddleware, updateUserLocation, switchIdentity);

module.exports = router;
