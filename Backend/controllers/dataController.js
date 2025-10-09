const jwt = require('jsonwebtoken');
const User = require('../model/user');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Render-compatible email transporter
const createEmailTransporter = () => {
  try {
    console.log('📧 Creating email transporter for Render...');
    
    // Use Render's SMTP service or alternative configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465, // Use SSL port instead of 587
      secure: true, // Use SSL
      auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASSWORD
      },
      connectionTimeout: 10000, // Shorter timeout for Render
      socketTimeout: 10000,
      debug: true,
      logger: true
    });
    
    console.log('✅ Email transporter created successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
    throw error;
  }
};

// Quick connection test with shorter timeout
const testEmailConnection = async () => {
  try {
    const transporter = createEmailTransporter();
    // Use a shorter timeout for testing
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Test timeout')), 5000)
    );
    
    await Promise.race([transporter.verify(), timeoutPromise]);
    console.log('✅ Email connection test passed');
    return true;
  } catch (error) {
    console.log('ℹ️ Email connection test skipped (expected on Render):', error.message);
    return false; // Don't fail the app, just continue
  }
};

// Test email (non-blocking)
testEmailConnection().then(success => {
  if (success) {
    console.log('🚀 Email service ready');
  } else {
    console.log('⚠️ Email service may not work on this environment');
  }
});

exports.signup = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ name, email });
    await user.save();

    // Send welcome email (non-blocking with error handling)
    (async () => {
      try {
        console.log(`📧 Attempting to send welcome email to: ${email}`);
        
        const transporter = createEmailTransporter();
        
        const mailOptions = {
          from: `"StockBud Team" <${process.env.EMAIL}>`,
          to: email,
          subject: `🎉 Welcome to StockBud, ${name}!`,
          html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f9fafb; padding: 40px 0; color: #1f2937;">
              <div style="max-width: 640px; margin: auto; background: #ffffff; border-radius: 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.05); overflow: hidden;">
                
                <!-- Header -->
                <div style="background: #4F46E5; color: white; text-align: center; padding: 30px 20px;">
                  <h1 style="margin: 0; font-size: 24px;">Welcome to <span style="color: #a5b4fc;">StockBud</span> 🎉</h1>
                </div>
                
                <!-- Body -->
                <div style="padding: 30px;">
                  <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>

                  <p style="font-size: 15px; line-height: 1.7;">
                    We're thrilled to have you on board! You've just joined a community of smart business owners who are taking control of their store management with ease.
                  </p>

                  <p style="font-weight: 600; margin-top: 25px;">Here's what you can look forward to with StockBud:</p>

                  <ul style="padding: 0; list-style: none; font-size: 15px; line-height: 1.6;">
                    <li>✅ <strong>Smart Inventory Management</strong> – never run out of stock unexpectedly.</li>
                    <li>✅ <strong>Customer Insights</strong> – understand what drives your sales.</li>
                    <li>✅ <strong>AI Marketing Assistant</strong> – grow faster with smart suggestions.</li>
                    <li>✅ <strong>Easy Reports</strong> – get clear summaries anytime.</li>
                    <li>✅ <strong>Works Online & Offline</strong> – manage your business anywhere.</li>
                  </ul>

                  <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 25px 0;">
                    <p style="margin: 0; font-size: 15px;">
                      ✨ <strong>Next Steps:</strong><br>
                      You're on our exclusive waitlist — we'll notify you first when StockBud officially launches! Expect updates, insights, and early-bird offers.
                    </p>
                  </div>

                  <div style="background: #eef2ff; padding: 16px; border-radius: 8px; margin: 25px 0;">
                    <p style="margin: 0; font-size: 15px;">
                      💡 <strong>Got a minute?</strong><br>
                      Reply to this email and tell us your biggest store management challenge — your feedback helps shape StockBud's features.
                    </p>
                  </div>

                  <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">
                    Thank you for joining us on this journey. Together, we'll make managing your store easier, smarter, and more rewarding.
                  </p>

                  <p style="margin-top: 20px; font-size: 15px;">Warm regards,<br><strong>The StockBud Team</strong></p>

                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                  <p style="font-size: 13px; color: #6b7280;">
                    <strong>P.S.</strong> Love the idea of StockBud? Invite your friends to join the waitlist:
                    <a href="https://stock-bud.vercel.app/" style="color: #4F46E5; text-decoration: none;">Join Waitlist</a>
                  </p>
                </div>

                <!-- Footer -->
                <div style="background: #f9fafb; text-align: center; padding: 15px 20px; font-size: 12px; color: #9ca3af;">
                  © ${new Date().getFullYear()} StockBud. All rights reserved.
                </div>

              </div>
            </div>
          `
        };

        // Send email with timeout
        const sendPromise = transporter.sendMail(mailOptions);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Email send timeout')), 10000)
        );

        await Promise.race([sendPromise, timeoutPromise]);
        console.log('✅ Welcome email sent successfully to:', email);
        
      } catch (emailError) {
        console.error('❌ Failed to send welcome email:', emailError.message);
        // Don't throw - just log the error
      }
    })(); // Immediately invoked async function

    res.status(201).json({ 
      message: 'User created successfully',
      note: 'Welcome email is being sent in background'
    });
    
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

    try {
      const transporter = createEmailTransporter();

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

      // Send with timeout
      const sendPromise = transporter.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Email send timeout')), 10000)
      );

      await Promise.race([sendPromise, timeoutPromise]);

      res.status(200).json({ 
        message: `Email sent successfully to ${recipientEmails.length} recipients`,
        recipients: recipientEmails.length
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      res.status(500).json({ message: 'Failed to send email: ' + emailError.message });
    }
    
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ message: 'Failed to send email: ' + error.message });
  }
};

exports.googleAuth = async (req, res) => {
  const { token } = req.body;
  
  try {
    // Check if token is provided
    if (!token) {
      return res.status(400).json({ message: 'No token provided' });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    
    if (!payload) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    const { name, email, sub } = payload;

    if (!email) {
      return res.status(400).json({ message: 'Email not provided by Google' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Check admin status
    let isAdmin = false;
    if (process.env.ADMIN_EMAIL) {
      const adminEmail = process.env.ADMIN_EMAIL.toLowerCase().trim();
      isAdmin = normalizedEmail === adminEmail;
    } else {
      // Fallback
      const adminEmails = ['abubakar.nabil.210@gmail.com'];
      isAdmin = adminEmails.some(adminEmail => 
        adminEmail.toLowerCase().trim() === normalizedEmail
      );
    }
    
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = new User({ 
        name: name || 'Unknown', 
        email: normalizedEmail, 
        googleId: sub, 
        isAdmin 
      });
      await user.save();
    } else {
      if (user.isAdmin !== isAdmin) {
        user.isAdmin = isAdmin;
      }
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
    console.error('Google auth error:', error);
    
    if (error.message.includes('Token used too late')) {
      return res.status(400).json({ message: 'Token has expired. Please try again.' });
    }
    if (error.message.includes('Invalid token signature')) {
      return res.status(400).json({ message: 'Invalid token. Please try again.' });
    }
    
    res.status(500).json({ message: 'Authentication failed: ' + error.message });
  }
};

// Timer for 160 days
exports.getTimer = (req, res) => {
  const days = 160;
  const timerInSeconds = days * 24 * 60 * 60;
  
  res.status(200).json({ 
    timer: timerInSeconds,
    days: days,
    message: `Timer set to ${days} days`
  });
};