// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  accountNumber: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  aadhar: { type: String },
  dob: { type: Date },
  occupation: { type: String },
  balance: { type: Number, default: 1000 },
  userId: { type: String, unique: true, sparse: true },  // Make the index sparse
  password: { type: String },
  transactionPassword: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isActive: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
