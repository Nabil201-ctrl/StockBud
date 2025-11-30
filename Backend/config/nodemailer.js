const nodemailer = require('nodemailer');
const dotenv = require('dotenv')
dotenv.config();

const createTransporter = async () => {
  // Create a transporter using Zoho Mail
  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  return transporter;
};

module.exports = createTransporter;
