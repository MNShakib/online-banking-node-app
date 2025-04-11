# Online Banking Application

OnlineBanking Application is a web-based system that lets you open a bank account, register for internet banking, and perform secure transactions. An admin reviews and approves account requests, and users get email notifications when their account is approved, when they forget their password, or if they forget their user ID.

Key Features
Account Opening:
Users can submit a request to open a bank account.
Note: The account remains inactive until approved by an admin.

User Registration & Login:
Once approved, users register for internet banking and log in securely.

OTP Email Verification:
For both password resets and forgotten user IDs, a one-time 6-digit OTP is sent via email.

Admin Panel:
Admins log in to review and approve or reject account requests.
Upon approval, users get an email with their account number. If rejected, users are emailed and asked to apply again.

Technologies Used
Backend: Node.js, Express, MongoDB

Frontend: EJS (with Tailwind CSS for styling)

Email/OTP: Nodemailer for sending emails and OTPs

Authentication: Session-based authentication with express-session

Getting Started
Prerequisites
Node.js and npm

MongoDB (local or hosted)

Installation
Clone this repository:

bash
Copy
git clone <your-repository-url>
cd online-banking-application
Install dependencies:

bash
Copy
npm install
Set Up Environment Variables:

Create a .env file in the root directory and add:

env
Copy
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/online_bank
SESSION_SECRET=supersecretkey123

# Email configuration (example using Gmail) Online Banking Application
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your.email@example.com
EMAIL_PASS=yourEmailAppPassword
Run the Application:

bash
Copy
npm start
Visit http://localhost:3000 in your browser.

How It Works
Opening an Account:
Fill out the form under "Open Account." Your request is stored as pending. An admin will approve or reject your request.

Admin Approval:
Admins log in (default admin: userId admin, password adminpass) and review pending requests.

When an account is approved, an email is sent with your account number.

When rejected, you receive an email asking you to reapply with correct credentials.

Registration & Login:
Once your account is approved, you register for online banking and log in.

Forgot Password/User ID:
Use the respective forms to get an OTP sent via email. After verifying the OTP, you can reset your password or view your user ID.

Project Structure
bash
Copy
online-banking-application/
├── controllers/       # Request handling logic
├── middlewares/       # Authentication checks
├── models/            # Mongoose schemas (User, etc.)
├── routes/            # Route definitions for auth and admin
├── views/             # EJS templates with Tailwind CSS
├── .env               # Environment variables
├── app.js             # Main server file
└── package.json       # Node.js dependencies and scripts
