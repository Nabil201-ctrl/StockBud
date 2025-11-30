const nodemailer = require('nodemailer');
const dotenv = require('dotenv')
dotenv.config();

const createTransporter = async () => {
  // Create a transporter using Zoho Mail
const transporter = nodemailer.createTransport({
    service: 'zoho',
    auth: {
        user: process.env.ZOHO_SMTP_USER,
        pass: process.env.ZOHO_SMTP_PASSWORD,
    },
});

async function sendEmail(recipient, subject, text, html) {
    const mailOptions = {
        from: process.env.ZOHO_USER,
        to: recipient,
        subject,
        text,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.response);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
}

  return transporter;
};

module.exports = createTransporter;
