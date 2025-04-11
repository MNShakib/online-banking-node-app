// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const ensureLoggedIn = require('../middlewares/auth').ensureLoggedIn;

router.get('/dashboard', ensureLoggedIn, userController.getDashboard);
router.get('/profile', ensureLoggedIn, userController.getAccountDetails);       // view account details
router.post('/profile', ensureLoggedIn, userController.postUpdateDetails);     // update account details
router.get('/account-statement', ensureLoggedIn, userController.getStatement); // view statement filter form
router.post('/account-statement', ensureLoggedIn, userController.postStatement); // fetch statement results
router.get('/account-summary', ensureLoggedIn, userController.getSummary);     // quick summary (balance & recent txns)
router.get('/change-password', ensureLoggedIn, userController.getChangePassword);
router.post('/change-password', ensureLoggedIn, userController.postChangePassword);

// Fund Transfer routes (also under userController for logged-in users)
router.get('/add-payee', ensureLoggedIn, userController.getAddPayee);
router.post('/add-payee', ensureLoggedIn, userController.postAddPayee);
router.get('/transfer', ensureLoggedIn, userController.getTransfer);
router.post('/transfer', ensureLoggedIn, userController.postTransfer);

module.exports = router;
