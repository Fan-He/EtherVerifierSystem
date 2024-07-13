const express = require('express');
const { register, login, getProfile, getUserProfileByEmail, switchIdentity, getIdentityCounts, requestRandomNumber, checkRequestFulfillment, getLatestRandomNumbe, getAllUsers, getAllProviders  } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const updateUserLocation = require('../middleware/updateUserLocation');

const router = express.Router();

router.post('/register', register, updateUserLocation);
router.post('/login', login, updateUserLocation);
router.get('/profile', authMiddleware, updateUserLocation, getProfile);
router.get('/profile/email/:email', authMiddleware, updateUserLocation, getUserProfileByEmail);
//router.post('/switch-identity', authMiddleware, updateUserLocation, switchIdentity);
router.get('/identity-counts', authMiddleware, getIdentityCounts);
// router.post('/request-random-number', authMiddleware, requestRandomNumber);
// router.get('/check-request-fulfillment', authMiddleware, checkRequestFulfillment);
// router.get('/latest-random-number', authMiddleware, getLatestRandomNumber);
router.get('/users', authMiddleware, getAllUsers);
router.get('/providers', authMiddleware, getAllProviders);


module.exports = router;