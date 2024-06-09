const express = require('express');
const { register, login, getProfile, getUserProfileByEmail, switchIdentity } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.get('/profile/email/:email', authMiddleware, getUserProfileByEmail);
router.post('/switch-identity', authMiddleware, switchIdentity);

module.exports = router;
