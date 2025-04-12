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
  