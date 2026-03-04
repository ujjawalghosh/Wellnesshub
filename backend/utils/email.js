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
    return { success: true };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Send OTP email (supports different types: login, verification, 2fa)
const sendOTPEmail = async (email, otp, type = 'login') => {
  let subject = 'Your WellnessHub OTP';
  let text = '';
  
  switch (type) {
    case 'verification':
      subject = 'Verify your WellnessHub Email';
      text = `Your verification code is: ${otp}. This code expires in 10 minutes.`;
      break;
    case '2fa':
      subject = 'Your WellnessHub 2FA Code';
      text = `Your 2FA code is: ${otp}. This code expires in 10 minutes.`;
      break;
    case 'login':
    default:
      subject = 'Your WellnessHub OTP';
      text = `Your OTP code is: ${otp}. This code expires in 10 minutes.`;
  }
  
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

