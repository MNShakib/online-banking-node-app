// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');
const MongoStore = require('connect-mongo');  // to store sessions in MongoDB
const flash = require('connect-flash');       // for flash messages
const expressLayouts = require('express-ejs-layouts');
const bcrypt = require('bcrypt');             // required for hashing passwords

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import the User model to seed the admin account
const User = require('./models/User');

const app = express();

// Set EJS as templating engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use express-ejs-layouts and set the default layout
app.use(expressLayouts);
app.set('layout', 'layout');

// MongoDB Connection using environment variable
mongoose.connect(process.env.MONGODB_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(async () => {
    console.log("MongoDB connected");
    // Seed admin account if none exists.
    await seedAdmin();
    // Start the server after seeding admin.
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
       console.log(`Server running on http://localhost:${PORT}`);
    });
})
.catch(err => console.error("MongoDB connection error:", err));

// Session Configuration using environment variable for the secret and MongoDB URI
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 1000 * 60 * 60, httpOnly: true } // 1 hour session, HTTP-only cookie
}));

// Body parsers for form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Flash messages middleware
app.use(flash());
app.use((req, res, next) => {
    res.locals.successMsg = req.flash('success');
    res.locals.errorMsg = req.flash('error');
    next();
});

// Make session available in views
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Serve static files (like CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Mount routes
app.use('/', authRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

// Function to seed the admin account
async function seedAdmin() {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const newAdmin = new User({
                name: "Admin User",
                email: process.env.ADMIN_EMAIL,
                phone: process.env.ADMIN_PHONE,
                role: "admin",
                isActive: true,
                accountNumber: "ADMIN001",
                userId: "admin"
            });
            // Hash the password "adminpass" using bcrypt
            newAdmin.password = await bcrypt.hash("adminpass", 10);
            await newAdmin.save();
            console.log("Admin account created: userId=admin, password=adminpass");
        } else {
            console.log("Admin account already exists.");
        }
    } catch (err) {
        console.error("Error seeding admin account:", err);
    }
}
