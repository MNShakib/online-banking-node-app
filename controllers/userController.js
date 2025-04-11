// controllers/userController.js
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Payee = require('../models/Payee');

exports.getDashboard = async (req, res) => {
    try {
        // Fetch user and maybe some summary info
        const user = await User.findById(req.session.userId);
        // Fetch recent 5 transactions for account summary
        const recentTxns = await Transaction.find({ fromAccount: user.accountNumber })
                              .sort({ date: -1 }).limit(5);
        res.render('dashboard', { user, recentTxns });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.redirect('/login');
    }
};

exports.getAccountDetails = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        res.render('accountDetails', { user });
    } catch (err) {
        console.error("GetAccountDetails error:", err);
        res.redirect('/user/dashboard');
    }
};

exports.postUpdateDetails = async (req, res) => {
    // Allow user to update certain profile fields (e.g., address, phone, email)
    const { phone, address, email } = req.body;
    try {
        await User.findByIdAndUpdate(req.session.userId, { phone, address, email });
        req.flash('success', 'Profile updated successfully');
        res.redirect('/user/profile');
    } catch (err) {
        console.error("UpdateDetails error:", err);
        req.flash('error', 'Could not update details');
        res.redirect('/user/profile');
    }
};

exports.getSummary = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const recentTxns = await Transaction.find({ fromAccount: user.accountNumber })
                              .sort({ date: -1 }).limit(5);
        res.render('accountSummary', { user, recentTxns });
    } catch (err) {
        console.error("Summary error:", err);
        res.redirect('/user/dashboard');
    }
};

exports.getStatement = (req, res) => {
    res.render('accountStatement', { transactions: null });
};

exports.postStatement = async (req, res) => {
    // Filter transactions by date range
    const { fromDate, toDate } = req.body;
    try {
        const user = await User.findById(req.session.userId);
        let query = { fromAccount: user.accountNumber };
        if (fromDate && toDate) {
            query.date = { $gte: new Date(fromDate), $lte: new Date(toDate) };
        }
        const transactions = await Transaction.find(query).sort({ date: -1 });
        res.render('accountStatement', { transactions });
    } catch (err) {
        console.error("Statement error:", err);
        req.flash('error', 'Unable to retrieve statements');
        res.render('accountStatement', { transactions: [] });
    }
};

exports.getChangePassword = (req, res) => {
    res.render('changePassword');
};

exports.postChangePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
        req.flash('error', 'New passwords do not match');
        return res.redirect('/user/change-password');
    }
    try {
        const user = await User.findById(req.session.userId);
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            req.flash('error', 'Current password is incorrect');
            return res.redirect('/user/change-password');
        }
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        req.flash('success', 'Password changed successfully');
        res.redirect('/user/dashboard');
    } catch (err) {
        console.error("ChangePassword error:", err);
        req.flash('error', 'Failed to change password');
        res.redirect('/user/change-password');
    }
};

// === Fund Transfer related controllers ===

exports.getAddPayee = async (req, res) => {
    res.render('addPayee');
};

exports.postAddPayee = async (req, res) => {
    const { name, accountNumber, nickname } = req.body;
    try {
        const user = await User.findById(req.session.userId);
        // Create a new payee linked to this user (by owner's account number)
        const payee = new Payee({ ownerAccount: user.accountNumber, name, accountNumber, nickname });
        await payee.save();
        req.flash('success', 'Payee added successfully');
        res.redirect('/user/transfer');
    } catch (err) {
        console.error("AddPayee error:", err);
        req.flash('error', 'Failed to add payee');
        res.redirect('/user/add-payee');
    }
};

exports.getTransfer = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        const payees = await Payee.find({ ownerAccount: user.accountNumber });
        res.render('transfer', { user, payees });
    } catch (err) {
        console.error("GetTransfer error:", err);
        res.redirect('/user/dashboard');
    }
};

exports.postTransfer = async (req, res) => {
    const { beneficiaryAccount, amount, mode } = req.body;
    try {
        const user = await User.findById(req.session.userId);
        if (!beneficiaryAccount || !amount || !mode) {
            req.flash('error', 'Please fill all required fields');
            return res.redirect('/user/transfer');
        }
        const transferAmount = parseFloat(amount);
        if (transferAmount > user.balance) {
            req.flash('error', 'Insufficient balance for this transfer');
            return res.redirect('/user/transfer');
        }
        // Deduct from sender
        user.balance -= transferAmount;
        await user.save();
        // If the beneficiary is an internal account in our bank, credit them
        const beneficiary = await User.findOne({ accountNumber: beneficiaryAccount, isActive: true });
        if (beneficiary) {
            beneficiary.balance += transferAmount;
            await beneficiary.save();
        }
        // Record the transaction
        const txn = new Transaction({
            fromAccount: user.accountNumber,
            toAccount: beneficiaryAccount,
            amount: transferAmount,
            mode: mode,
            date: new Date(),
            status: 'SUCCESS',
            remark: 'Fund transfer'
        });
        await txn.save();
        // Render success page with transaction details
        res.render('transferSuccess', { transaction: txn });
    } catch (err) {
        console.error("Transfer error:", err);
        req.flash('error', 'Transfer failed due to an error');
        res.redirect('/user/transfer');
    }
};
