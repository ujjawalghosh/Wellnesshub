const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-email-password'
    }
  });
};

// Send email
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to,
      subject,
      text
    });
    
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    return false;
  }
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const subject = 'Your WellnessHub OTP';
  const text = `Your OTP code is: ${otp}. This code expires in 10 minutes.`;
  return sendEmail(email, subject, text);
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to WellnessHub!';
  const text = `Hi ${name},\n\nWelcome to WellnessHub! We're excited to have you on board.\n\nBest regards,\nThe WellnessHub Team`;
  return sendEmail(email, subject, text);
};

module.exports = {
  sendEmail,
  sendOTPEmail,
  sendWelcomeEmail
};

