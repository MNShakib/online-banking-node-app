// // routes/adminRoutes.js
// const express = require('express');
// const router = express.Router();
// const adminController = require('../controllers/adminController');
// const { ensureLoggedIn, ensureAdmin } = require('../middlewares/auth');

// router.get('/dashboard', ensureLoggedIn, ensureAdmin, adminController.getAdminDashboard);
// router.post('/approve/:userId', ensureLoggedIn, ensureAdmin, adminController.postApproveAccount);
// router.post('/reject/:userId', ensureLoggedIn, ensureAdmin, adminController.postRejectAccount);

// module.exports = router;

// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureLoggedIn, ensureAdmin } = require('../middlewares/auth');

router.get('/dashboard', ensureLoggedIn, ensureAdmin, adminController.getAdminDashboard);
router.post('/approve/:userId', ensureLoggedIn, ensureAdmin, adminController.postApproveAccount);
router.post('/reject/:userId', ensureLoggedIn, ensureAdmin, adminController.postRejectAccount);

module.exports = router;
