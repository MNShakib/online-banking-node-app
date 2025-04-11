OnlineBanking Application
OnlineBanking Application is a full-stack online banking system built using Node.js, Express, and MongoDB. It provides users with the ability to open accounts, register for internet banking, and perform secure transactions. It also features an admin panel where bank personnel can approve or reject account opening requests. The system includes email-based OTP (One-Time Password) verification for both password reset and retrieving forgotten User IDs.

Table of Contents
Overview

Features

Technologies Used

Installation

Configuration

Usage

Project Structure

Email & OTP Flow

Admin Approval Process

Troubleshooting

License

Overview
The OnlineBanking Application aims to automate traditional bank processes to improve customer service, increase transparency, and provide a secure and user-friendly online banking experience. Users can submit an account opening request; once approved by an admin, they can register for internet banking. Features include:

User Registration and Login: Secure login with session-based authentication.

Account Opening: Submit bank account request which needs admin approval.

OTP Verification: Secure verification of OTP sent via email for password reset and retrieving forgotten User IDs.

Admin Panel: Dedicated section for bank administrators to review, approve, or reject account opening requests.

Email Notifications: Automatic sending of emails for account activation, password resets, and rejection notifications.

Features
User Management:

Create a new account (Open Account Request)

Register for online banking (once account is approved)

User login/logout with session authentication

Forgot Password flow using OTP via email

Forgot User ID flow using OTP via email

Reset Password once OTP is verified

Admin Panel:

Login to the admin dashboard using dedicated admin credentials

Review pending account opening requests

Approve accounts – this triggers an email to users with their account number and online banking details

Reject accounts – this triggers a rejection email and instructs the user to reapply with correct credentials

Email & OTP Integration:

Automatic sending of OTP to the user’s registered email address using Nodemailer

OTP is used to verify actions for both password reset and User ID retrieval

Technologies Used
Backend:

Node.js

Express.js

MongoDB (via Mongoose)

Express-session (for session management)

Nodemailer (for email notifications)

Frontend:

EJS templating engine

Tailwind CSS for styling

Other Tools:

dotenv for environment variable configuration

bcrypt for hashing passwords

Installation
Clone the Repository:

bash
Copy
git clone <your-repository-url>
cd online-banking-application
Install Dependencies:

Make sure you have Node.js and MongoDB installed. Then, run:

bash
Copy
npm install
Set Up MongoDB:

For local development, ensure MongoDB is installed and running.

By default, the application uses a MongoDB database called online_bank.

Configuration
Create a .env File:

In the root directory of your project, create a file named .env and add the following content (adjust according to your environment):

env
Copy
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/online_bank
SESSION_SECRET=supersecretkey123

# Email settings (example using Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your.email@example.com
EMAIL_PASS=yourEmailAppPassword
Indexing in MongoDB:

The user model ensures that the userId field is unique. If necessary, drop the old index (especially if you have inserted account requests with no userId) and let Mongoose build the new sparse index.
You can do this by running User.syncIndexes() in your code or using MongoDB Compass to drop the index manually.

Usage
Starting the Application:

bash
Copy
npm start
The server will start on the port defined in your .env file (default: 3000). Open your browser and navigate to:

arduino
Copy
http://localhost:3000/
User Flow:

Open Account:

New users can click "Open Account" to submit an account opening request.

The request is stored in the database as pending approval.

Admin Approval:

An admin logs in (using credentials seeded in the system, e.g., user ID: admin, password: adminpass).

The admin reviews pending requests, approves or rejects them.

On approval, the user receives an email with their account number and instructions.

On rejection, the user receives an email with feedback and instructions to reapply.

Registration and Login:

Once a user’s account is approved, they can register for internet banking by providing an account number, choosing a user ID, and setting a password.

After registration, users can log in via the login page.

Forgot Password / Forgot User ID:

Users can use the "forgot password" and "forgot user ID" flows, both employing OTP verification sent via email.

Upon successful OTP verification, users are allowed to reset their password or see their user ID.

Admin Flow:

Admin Login:

Admins use the same login form but are redirected to the admin dashboard upon successful login.

Admin Dashboard:

View pending account requests.

Approve or reject account requests, sending an email notification to the user in either case.

Project Structure
less
Copy
online-banking-application/
├── controllers/
│   ├── authController.js     // Handles login, registration, OTP flows for password and user ID
│   └── adminController.js    // Handles admin-specific actions (approval/rejection)
├── middlewares/
│   └── auth.js               // Contains functions for session and role-based access control
├── models/
│   └── User.js               // Mongoose schema for user data
├── routes/
│   ├── authRoutes.js         // Public routes for authentication and OTP verification
│   └── adminRoutes.js        // Admin routes for account approval/rejection
├── views/
│   ├── layout.ejs            // Base layout for all pages (includes header, footer, and Tailwind CSS)
│   ├── index.ejs             // Home page
│   ├── login.ejs             // Login page
│   ├── register.ejs          // Registration page for internet banking
│   ├── openAccount.ejs       // Form for opening an account request
│   ├── forgotPassword.ejs    // Form for initiating the forgot password flow
│   ├── verifyOTP.ejs         // OTP verification page (for password reset)
│   ├── resetPassword.ejs     // Password reset form page
│   ├── forgotUserId.ejs      // Form for initiating the forgot user ID flow
│   ├── verifyUserIdOTP.ejs   // OTP verification page for retrieving the user ID
│   └── adminDashboard.ejs    // Admin dashboard to view pending account requests
├── .env                      // Environment variable configuration
├── app.js                    // Main application file that sets up the server and routes
└── package.json              // Project dependencies and scripts
Email & OTP Flow
Forgot Password Flow
User visits the Forgot Password page and enters their User ID.

The server generates a 6-digit OTP, valid for 10 minutes, and sends it via email.

The user is redirected to an OTP verification page.

Once OTP is verified, the user is allowed to reset their password.

Forgot User ID Flow
User visits the Forgot User ID page and enters their Account Number.

The server searches for the account and, if found, generates an OTP.

The OTP is sent via email.

User inputs the OTP on the verification page.

Upon successful verification, the user’s User ID is displayed via a flash message, and they are redirected to the login page.

Admin Approval Process
