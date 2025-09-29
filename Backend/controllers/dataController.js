const jwt = require('jsonwebtoken');
const User = require('../model/user');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.signup = async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = new User({ name, email });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.sendEmail = async (req, res) => {
    try {
        const { message } = req.body;
        const users = await User.find();
        const emails = users.map(user => user.email);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: req.headers.authorization.split(' ')[1]
            }
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: emails.join(','),
            subject: 'Message from Admin',
            text: message
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.googleAuth = async (req, res) => {
    const { token } = req.body;
    
    try {
        // Debug: Check environment variables
        console.log('=== ENVIRONMENT VARIABLES IN CONTROLLER ===');
        console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Set' : '✗ Not set');
        console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? '✓ Set: ' + process.env.ADMIN_EMAIL : '✗ Not set');
        console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✓ Set' : '✗ Not set');
        console.log('==========================================');

        // Check if token is provided
        if (!token) {
            return res.status(400).json({ message: 'No token provided' });
        }

        console.log('Received token for verification');

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        
        const payload = ticket.getPayload();
        
        // Check if payload exists and has required fields
        if (!payload) {
            return res.status(400).json({ message: 'Invalid token payload' });
        }

        const { name, email, sub } = payload;

        // Validate required fields
        if (!email) {
            console.error('Email not found in Google payload:', payload);
            return res.status(400).json({ message: 'Email not provided by Google' });
        }

        console.log('Google auth successful - User email:', email);

        // Safe email comparison with environment variable
        const normalizedEmail = email.toLowerCase().trim();
        
        // Check if ADMIN_EMAIL is defined in environment
        if (!process.env.ADMIN_EMAIL) {
            console.error('ADMIN_EMAIL environment variable is not set!');
            // Fallback to hardcoded email for now
            const adminEmails = ['abubakar.nabil.210@gmail.com'];
            var isAdmin = adminEmails.some(adminEmail => 
                adminEmail.toLowerCase().trim() === normalizedEmail
            );
            console.log('Using fallback admin check:', { normalizedEmail, isAdmin });
        } else {
            // Use the environment variable
            const adminEmail = process.env.ADMIN_EMAIL.toLowerCase().trim();
            var isAdmin = normalizedEmail === adminEmail;
            console.log('Using environment variable admin check:', { 
                normalizedEmail, 
                adminEmail, 
                isAdmin 
            });
        }
        
        let user = await User.findOne({ email: normalizedEmail });

        console.log('User found in database:', user ? 'Yes' : 'No');
        if (user) {
            console.log('Current user admin status:', user.isAdmin);
        }

        if (!user) {
            user = new User({ 
                name: name || 'Unknown', 
                email: normalizedEmail, 
                googleId: sub, 
                isAdmin 
            });
            await user.save();
            console.log('New user created with admin status:', isAdmin);
        } else {
            // Update isAdmin status if it changed - FORCE UPDATE if needed
            if (user.isAdmin !== isAdmin) {
                console.log('Updating user admin status from', user.isAdmin, 'to', isAdmin);
                user.isAdmin = isAdmin;
                await user.save();
                console.log('User admin status updated successfully');
            } else {
                console.log('User admin status unchanged:', isAdmin);
            }
            
            // Also update other fields that might have changed
            user.name = name || user.name;
            user.googleId = sub;
            await user.save();
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                isAdmin: user.isAdmin 
            },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '1h' }
        );

        console.log('Final response - User isAdmin:', user.isAdmin);

        res.status(200).json({ 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            }, 
            token: jwtToken 
        });
        
    } catch (error) {
        console.error('Google auth error details:', error);
        
        // More specific error messages
        if (error.message.includes('Token used too late')) {
            return res.status(400).json({ message: 'Token has expired. Please try again.' });
        }
        if (error.message.includes('Invalid token signature')) {
            return res.status(400).json({ message: 'Invalid token. Please try again.' });
        }
        
        res.status(500).json({ message: 'Authentication failed: ' + error.message });
    }
};