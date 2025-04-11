// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public routes (no auth middleware)
router.get('/', authController.getHome);
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);
router.get('/register', authController.getRegister);           // Internet Banking registration (existing account)
router.post('/register', authController.postRegister);
router.get('/open-account', authController.getOpenAccount);    // New account opening request
router.post('/open-account', authController.postOpenAccount);
router.get('/account-locked', authController.getAccountLocked);

router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);

// Routes for OTP verification
router.get('/verify-otp', authController.getVerifyOTP);
router.post('/verify-otp', authController.postVerifyOTP);

// Routes for password reset
router.get('/reset-password', authController.getResetPassword);
router.post('/reset-password', authController.postResetPassword);

// New routes for forgot user ID flow:
router.get('/forgot-userid', authController.getForgotUserId);
router.post('/forgot-userid', authController.postForgotUserId);
router.get('/verify-userid-otp', authController.getVerifyUserIdOTP);
router.post('/verify-userid-otp', authController.postVerifyUserIdOTP);


module.exports = router;
