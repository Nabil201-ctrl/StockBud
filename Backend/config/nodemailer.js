const nodemailer = require('nodemailer');
const dotenv = require('dotenv')
dotenv.config();

const createTransporter = async () => {
  // Create a transporter using Gmail + App Password
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  return transporter;
};

module.exports = createTransporter;
