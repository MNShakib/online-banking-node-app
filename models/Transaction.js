// models/Transaction.js
const mongoose = require('mongoose');
const transactionSchema = new mongoose.Schema({
  fromAccount: { type: String, required: true },   // account number of sender
  toAccount: { type: String, required: true },     // account number of recipient (could be external)
  amount: { type: Number, required: true },
  mode: { type: String, enum: ['NEFT', 'RTGS', 'IMPS'], required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'SUCCESS' },
  remark: { type: String }
});
module.exports = mongoose.model('Transaction', transactionSchema);
