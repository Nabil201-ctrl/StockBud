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
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { name, email, sub } = ticket.getPayload();
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ name, email, googleId: sub });
            await user.save();
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};