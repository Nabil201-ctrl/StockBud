const jwt = require('jsonwebtoken');
const User = require('../model/user');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Create email transporter
const createTransporter = async () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN
    }
  });
};

exports.signup = async (req, res) => {
    try {
        const { name, email } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = new User({ name, email });
        await user.save();

        // Send welcome email
        try {
            const transporter = await createTransporter();
            const mailOptions = {
                from: process.env.EMAIL,
                to: email,
                subject: 'Welcome to StockBud 🚀',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #4F46E5; text-align: center;">Welcome to StockBud!</h2>
                        <p>Hello ${name},</p>
                        <p>We're excited to have you on board! StockBud is your AI-powered inventory management solution that will revolutionize how you handle stock.</p>
                        <p>Stay tuned for updates as we get closer to launch!</p>
                        <br>
                        <p>Best regards,<br>The StockBud Team</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log('Welcome email sent to:', email);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail the signup if email fails
        }

        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.error('Signup error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        res.status(500).json({ message: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.sendEmail = async (req, res) => {
    try {
        const { message, emails, sendToAll = false } = req.body;

        let recipientEmails = emails || [];

        // If sendToAll is true, get all user emails
        if (sendToAll) {
            const allUsers = await User.find({}, 'email');
            recipientEmails = allUsers.map(user => user.email);
        }

        if (!recipientEmails || recipientEmails.length === 0) {
            return res.status(400).json({ message: 'No recipients selected' });
        }

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ message: 'Message cannot be empty' });
        }

        const transporter = await createTransporter();

        const mailOptions = {
            from: `"StockBud Admin" <${process.env.EMAIL}>`,
            to: recipientEmails.join(','),
            subject: 'Important Update from StockBud',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #4F46E5; margin: 0;">StockBud Update</h2>
                    </div>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #4F46E5;">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #6b7280;">
                        <p>This email was sent from StockBud Admin Panel</p>
                        <p>If you have any questions, please contact our support team.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            message: `Email sent successfully to ${recipientEmails.length} recipients`,
            recipients: recipientEmails.length
        });
    } catch (error) {
        console.error('Send email error:', error);
        res.status(500).json({ message: 'Failed to send email: ' + error.message });
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

exports.getTimer = (req, res) => {
    res.status(200).json({ timer: 5 * 60 });
};