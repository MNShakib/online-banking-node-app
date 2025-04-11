// controllers/authController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Configure Nodemailer transporter using environment variables.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,          // e.g., "smtp.gmail.com"
  port: process.env.EMAIL_PORT,          // e.g., 465 for secure SMTP, or 587 for TLS
  secure: process.env.EMAIL_SECURE === 'true',  // true for 465; false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Home
exports.getHome = (req, res) => {
  res.render('index');
};

// Login
exports.getLogin = (req, res) => {
  res.render('login');
};

exports.postLogin = async (req, res) => {
  const { userId, password } = req.body;
  try {
    const user = await User.findOne({ userId: userId });
    if (!user || !user.isActive) {
      req.flash('error', 'Invalid User ID or account not active');
      return res.redirect('/login');
    }
    if (user.isLocked) {
      return res.redirect('/account-locked');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 3) {
        user.isLocked = true;
      }
      await user.save();
      if (user.isLocked) {
        return res.redirect('/account-locked');
      }
      req.flash('error', 'Incorrect password. Attempts remaining: ' + (3 - user.loginAttempts));
      return res.redirect('/login');
    }
    user.loginAttempts = 0;
    await user.save();
    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.accountNumber = user.accountNumber;

    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/user/dashboard');
    }
  } catch (err) {
    console.error("Login error:", err);
    req.flash('error', 'An error occurred. Please try again.');
    return res.redirect('/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

// Registration for Internet Banking
exports.getRegister = (req, res) => {
  res.render('register');
};

exports.postRegister = async (req, res) => {
  const { accountNumber, userId, password, confirmPassword, transactionPassword, confirmTransPassword } = req.body;
  if (password !== confirmPassword) {
    req.flash('error', 'Passwords do not match');
    return res.redirect('/register');
  }
  try {
    let user = await User.findOne({ accountNumber: accountNumber });
    if (!user || !user.isActive) {
      req.flash('error', 'Account not found or not active');
      return res.redirect('/register');
    }
    if (user.userId) {
      req.flash('error', 'Internet banking is already registered for this account.');
      return res.redirect('/login');
    }
    user.userId = userId;
    user.password = await bcrypt.hash(password, 10);
    if (transactionPassword) {
      user.transactionPassword = await bcrypt.hash(transactionPassword, 10);
    }
    await user.save();

    // Send activation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your Internet Banking is Activated',
      text: `Dear ${user.name},\n\nYour internet banking has been activated.\nUser ID: ${user.userId}\nPassword: ${password}\nAccount Number: ${user.accountNumber}\n\nThank you,\nOnlineBank Team`
    };

    await transporter.sendMail(mailOptions);
    req.flash('success', 'Registration successful! Your internet banking is activated. Check your email for details.');
    res.redirect('/login');
  } catch (err) {
    console.error("Registration error:", err);
    req.flash('error', 'Could not register. Possibly the chosen User ID is taken.');
    res.redirect('/register');
  }
};

// Open Account
exports.getOpenAccount = (req, res) => {
  res.render('openAccount');
};

exports.postOpenAccount = async (req, res) => {
  const { name, email, phone, address, dob, aadhar, occupation } = req.body;
  try {
    const newUser = new User({
      name, email, phone, address, dob, aadhar, occupation,
      isActive: false, // pending admin approval
      role: 'user'
    });
    await newUser.save();
    req.flash('success', 'Account request submitted. Please wait for admin approval.');
    res.redirect('/login');
  } catch (err) {
    console.error("Open account error:", err);
    req.flash('error', 'Failed to submit request. Please try again.');
    res.redirect('/open-account');
  }
};

// Account Locked
exports.getAccountLocked = (req, res) => {
  res.render('accountLocked');
};

// Forgot Password Flow with OTP via Email
exports.getForgotPassword = (req, res) => {
  res.render('forgotPassword');
};

exports.postForgotPassword = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findOne({ userId: userId });
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/forgot-password');
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    req.session.resetUserId = user.userId;
    req.session.otp = otp;
    req.session.otpExpires = otpExpires;
    req.session.otpVerified = false;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'OnlineBank Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`
    };
    await transporter.sendMail(mailOptions);
    req.flash('success', 'An OTP has been sent to your registered email address.');
    res.redirect('/verify-otp');
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    req.flash('error', 'Error sending OTP. Please try again.');
    res.redirect('/forgot-password');
  }
};

exports.getVerifyOTP = (req, res) => {
  res.render('verifyOTP');
};

exports.postVerifyOTP = (req, res) => {
  const { otp } = req.body;
  if (!req.session.otp || !req.session.otpExpires || Date.now() > req.session.otpExpires) {
    req.flash('error', 'OTP has expired. Please request a new one.');
    return res.redirect('/forgot-password');
  }
  if (otp === req.session.otp) {
    req.session.otpVerified = true;
    req.flash('success', 'OTP verified. You can now reset your password.');
    res.redirect('/reset-password');
  } else {
    req.flash('error', 'Invalid OTP. Please try again.');
    res.redirect('/verify-otp');
  }
};

exports.getResetPassword = (req, res) => {
  if (!req.session.otpVerified) {
    req.flash('error', 'Unauthorized access.');
    return res.redirect('/forgot-password');
  }
  res.render('resetPassword');
};

exports.postResetPassword = async (req, res) => {
  const { newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) {
    req.flash('error', 'Passwords do not match');
    return res.redirect('/reset-password');
  }
  try {
    const user = await User.findOne({ userId: req.session.resetUserId });
    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/forgot-password');
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.isLocked = false;
    user.loginAttempts = 0;
    await user.save();
    req.session.otp = null;
    req.session.otpExpires = null;
    req.session.otpVerified = null;
    req.session.resetUserId = null;
    req.flash('success', 'Password reset successful. You can now log in.');
    res.redirect('/login');
  } catch (err) {
    console.error("Reset password error:", err);
    req.flash('error', 'Error resetting password. Please try again.');
    res.redirect('/reset-password');
  }
};

// Forgot User ID Flow with OTP via Email
exports.getForgotUserId = (req, res) => {
  res.render('forgotUserId');
};

exports.postForgotUserId = async (req, res) => {
  const { accountNumber } = req.body;
  try {
    const user = await User.findOne({ accountNumber: accountNumber });
    if (!user) {
      req.flash('error', 'Account not found');
      return res.redirect('/forgot-userid');
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    req.session.forgotUserId = user._id;
    req.session.userIdOTP = otp;
    req.session.userIdOTPExpires = otpExpires;
    req.session.userIdOTPVerified = false;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'OnlineBank: Retrieve User ID - OTP Verification',
      text: `Your OTP to retrieve your User ID is: ${otp}. It expires in 10 minutes.`
    };
    await transporter.sendMail(mailOptions);
    req.flash('success', 'An OTP has been sent to your registered email to retrieve your User ID.');
    res.redirect('/verify-userid-otp');
  } catch (err) {
    console.error("Error in forgotUserId:", err);
    req.flash('error', 'Error sending OTP. Please try again.');
    res.redirect('/forgot-userid');
  }
};

exports.getVerifyUserIdOTP = (req, res) => {
  res.render('verifyUserIdOTP');
};

exports.postVerifyUserIdOTP = async (req, res) => {
  const { otp } = req.body;
  if (!req.session.userIdOTP || !req.session.userIdOTPExpires || Date.now() > req.session.userIdOTPExpires) {
    req.flash('error', 'OTP expired. Please try again.');
    return res.redirect('/forgot-userid');
  }
  if (otp === req.session.userIdOTP) {
    req.session.userIdOTPVerified = true;
    try {
      const user = await User.findById(req.session.forgotUserId);
      if (!user || !user.userId) {
        req.flash('error', 'User not found or User ID not set. Please register.');
        return res.redirect('/register');
      }
      req.flash('success', `Your User ID is: ${user.userId}`);
      req.session.userIdOTP = null;
      req.session.userIdOTPExpires = null;
      req.session.userIdOTPVerified = null;
      req.session.forgotUserId = null;
      res.redirect('/login');
    } catch (err) {
      console.error("Error in verifying User ID OTP:", err);
      req.flash('error', 'An error occurred. Please try again.');
      res.redirect('/forgot-userid');
    }
  } else {
    req.flash('error', 'Invalid OTP. Please try again.');
    res.redirect('/verify-userid-otp');
  }
};
