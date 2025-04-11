// models/Payee.js
const mongoose = require('mongoose');
const payeeSchema = new mongoose.Schema({
  ownerAccount: { type: String, required: true },  // account number of the user who owns this payee
  name: { type: String, required: true },
  accountNumber: { type: String, required: true },
  nickname: { type: String }
});
module.exports = mongoose.model('Payee', payeeSchema);
