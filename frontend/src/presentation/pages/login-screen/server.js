require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios'); // Ensure axios is required
 
const app = express();
app.use(cors());
app.use(bodyParser.json());
 
// Store OTPs temporarily in memory (for simplicity, a Map)
let otpStore = new Map();
 
// Configure transporter with nodemailer and Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false, // Avoid TLS errors
    },
    secure: true, // Enable SSL/TLS connection
});
 
// POST endpoint to send the verification code
app.post('/send-code', async (req, res) => {
    const { email } = req.body;
 
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }
 
    console.log(`Sending verification code to: ${email}`);
 
    try {
        // Generate a 4-digit verification code
        const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
 
        // Store the OTP for the email
        otpStore.set(email, verificationCode);
 
        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender email
            to: email, // Recipient email
            subject: 'Your Verification Code',
            text: `Your verification code is: ${verificationCode}`, // Verification code text
        };
 
        // Send the email using the transporter
        await transporter.sendMail(mailOptions);
 
        // Respond with success
        res.status(200).json({
            message: 'Verification code sent successfully',
            code: verificationCode, // Optionally send the code back for debugging
        });
    } catch (error) {
        console.error('Error sending email:', error); // Log the error in detail for debugging
        res.status(500).json({
            message: 'Failed to send verification code',
            error: error.message, // Provide a more detailed error message in the response
        });
    }
});
 
// POST endpoint to verify OTP
app.post('/verify-otp', (req, res) => {
    const { email, enteredOtp } = req.body;
 
    if (!email || !enteredOtp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }
 
    console.log("Entered OTP for email:", email, "OTP:", enteredOtp); // Log for debugging
 
    // Retrieve the stored OTP for the email
    const storedOtp = otpStore.get(email);
 
    if (!storedOtp) {
        return res.status(400).json({ message: 'OTP not found for this email. Please request a new one.' });
    }
 
    // Compare the entered OTP with the stored OTP
    if (enteredOtp === storedOtp) {
        res.status(200).json({ message: 'OTP verified successfully' });
    } else {
        res.status(400).json({ message: 'Incorrect OTP. Please try again.' });
    }
});
 
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});