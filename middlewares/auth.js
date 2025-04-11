// // middlewares/auth.js
// module.exports.ensureLoggedIn = function(req, res, next) {
//     if (req.session.userId) {
//         // If user is logged in (session contains userId), proceed
//         next();
//     } else {
//         // Not logged in – redirect to login page
//         req.flash('error', 'Please log in to continue');
//         res.redirect('/login');
//     }
// };

// module.exports.ensureAdmin = function(req, res, next) {
//     if (req.session.userId && req.session.role === 'admin') {
//         next();
//     } else {
//         // Forbidden – if logged in as non-admin, or not logged in at all
//         res.status(403);
//         return res.render('error.ejs', { message: "Access denied. Admins only." });
//     }
// };
// middlewares/auth.js
module.exports.ensureLoggedIn = function(req, res, next) {
    if (req.session.userId) {
      next();
    } else {
      req.flash('error', 'Please log in to continue');
      res.redirect('/login');
    }
  };
  
  module.exports.ensureAdmin = function(req, res, next) {
    if (req.session.userId && req.session.role === 'admin') {
      next();
    } else {
      res.status(403).render('error', { message: "Access denied. Admins only." });
    }
  };
  