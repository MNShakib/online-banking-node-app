// controllers/adminController.js
const User = require('../models/User');
const nodemailer = require('nodemailer');

// Configure Nodemailer transporter (if not already shared or imported from a common file)
// You can either import the transporter you set up in authController.js,
// or re-create it here using environment variables.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,          // e.g., "smtp.gmail.com"
  port: process.env.EMAIL_PORT,          // e.g., 465 for secure SMTP
  secure: process.env.EMAIL_SECURE === 'true',  // true for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// GET /admin/dashboard – Example: fetch pending accounts for admin.
// (Implementation details may vary; this is just an example.)
exports.getAdminDashboard = async (req, res) => {
  try {
    const pendingAccounts = await User.find({ isActive: false });
    res.render('adminDashboard', { pendingAccounts });
  } catch (err) {
    console.error("Error fetching pending accounts:", err);
    req.flash('error', 'Unable to load dashboard');
    res.redirect('/');
  }
};

// POST /admin/approve/:userId – Approve a user's account.
exports.postApproveAccount = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Approve the account: set it as active.
    user.isActive = true;
    // Generate an account number.
    user.accountNumber = "ACC" + Math.floor(10000000 + Math.random() * 90000000);

    // Save the updated user.
    await user.save();

    // Prepare an email with the account approval details.
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your Bank Account Has Been Approved',
      text: `Dear ${user.name},
      
Your account request has been approved. Below are your account details:

User ID: ${user.userId ? user.userId : "Not registered for online banking yet"}
Account Number: ${user.accountNumber}

Thank you for choosing OnlineBank.
      
Best regards,
OnlineBank Team`
    };

    // Send the email.
    await transporter.sendMail(mailOptions);
    req.flash('success', `Account for ${user.name} approved and email sent with account details.`);
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error("ApproveAccount error:", err);
    req.flash('error', 'Could not approve account');
    res.redirect('/admin/dashboard');
  }
};

// POST /admin/reject/:userId – (Optional) Reject a user's account request.
exports.postRejectAccount = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Prepare rejection email.
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your Bank Account Request Has Been Rejected',
      text: `Dear ${user.name},\n\nWe regret to inform you that your account request has been rejected.\n\nPlease ensure that all submitted credentials are correct and complete. You may re-apply by creating a new account.\n\nThank you,\nOnlineBank Team`
    };

    await transporter.sendMail(mailOptions);
    // Delete the pending account from the database so the user can re-apply.
    await User.findByIdAndDelete(userId);
    req.flash('success', 'Account request rejected, and a notification email has been sent to the user.');
    res.redirect('/admin/dashboard');
  } catch (err) {
    console.error("RejectAccount error:", err);
    req.flash('error', 'Could not reject account');
    res.redirect('/admin/dashboard');
  }
};
