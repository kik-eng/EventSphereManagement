const express = require('express');
const router = express.Router();

// Auth Controller Functions Import
const { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  resetPassword 
} = require('../controllers/authController');

// Auth Validator Middlewares Import
const { 
  validateRegisterInput, 
  validateLoginInput, 
  validateForgotPasswordInput, 
  validateResetPasswordInput 
} = require('../validator/userValidator');

// 1. User Registration Route
router.post('/register', validateRegisterInput, registerUser);

// 2. User Login Route
router.post('/login', validateLoginInput, loginUser);

// 3. Forgot Password Request Route
router.post('/forgot-password', validateForgotPasswordInput, forgotPassword);

// 4. Reset Password Action Route
router.post('/reset-password', validateResetPasswordInput, resetPassword);

module.exports = router;