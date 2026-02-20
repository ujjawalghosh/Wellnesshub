const nodemailer = require('nodemailer');

// Create transporter
// For development, you can use Gmail, Outlook, or any SMTP service
// For production, use services like SendGrid, Mailgun, AWS SES, etc.
const createTransporter = () => {
  // Check if email credentials are configured
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn('Email credentials not configured. OTP emails will be logged to console.');
    // Return a mock transporter for development
    return {
      sendMail: async (options) => {
        console.log('===== EMAIL (Development Mode) =====');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Body:', options.text);
        console.log('=====================================');
        return { messageId: 'dev-mode' };
      }
    };
  }

  return nodemailer.createTransport({
    service: 'gmail', // Or use 'smtp' with host/port for other providers
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

const transporter = createTransporter();

// Send OTP Email
const sendOTPEmail = async (email, otp, type = 'login') => {
  const subject = type === 'verification' 
    ? 'Verify your WellnessHub Email' 
    : 'Your WellnessHub OTP Code';
  
  const message = type === 'verification'
    ? `
Dear User,

Welcome to WellnessHub!

Your email verification code is: ${otp}

This code will expire in 10 minutes.

Please enter this code on the verification page to complete your registration.

If you didn't create this account, please ignore this email.

Best regards,
WellnessHub Team
    `
    : `
Dear User,

Your One-Time Password (OTP) for login is: ${otp}

This code will expire in 10 minutes.

Please enter this code on the login page to access your account.

If you didn't request this OTP, please ignore this email.

Best regards,
WellnessHub Team
    `;

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"WellnessHub" <noreply@wellnesshub.com>',
      to: email,
      subject: subject,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">WellnessHub</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">${type === 'verification' ? 'Verify Your Email' : 'Your OTP Code'}</h2>
            <p style="color: #666;">Your verification code is:</p>
            <div style="background: #fff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
            <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
          </div>
          <div style="padding: 15px; text-align: center; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} WellnessHub. All rights reserved.</p>
          </div>
        </div>
      `
    });
    
    console.log('OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Send Welcome Email
const sendWelcomeEmail = async (email, name) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"WellnessHub" <noreply@wellnesshub.com>',
      to: email,
      subject: 'Welcome to WellnessHub!',
      text: `
Dear ${name},

Welcome to WellnessHub!

We're excited to have you on your wellness journey. Start tracking your habits, join challenges, and achieve your wellness goals!

Get started:
- Complete your profile
- Set your wellness goals
- Join daily challenges
- Track your habits

Best regards,
WellnessHub Team
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">WellnessHub</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2 style="color: #333;">Welcome, ${name}!</h2>
            <p style="color: #666;">We're excited to have you on your wellness journey!</p>
            <p style="color: #666;">Start tracking your habits, join challenges, and achieve your wellness goals.</p>
            <div style="margin: 20px 0;">
              <a href="#" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Get Started</a>
            </div>
          </div>
          <div style="padding: 15px; text-align: center; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} WellnessHub. All rights reserved.</p>
          </div>
        </div>
      `
    });
    
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail
};
