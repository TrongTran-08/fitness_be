const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${process.env.FRONTEND_URL || 'https://fitness-tracking-qfkrj.ondigitalocean.app'}/api/verify-email/${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Fitness Tracking Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a4a4a;">Welcome to Fitness Tracking!</h2>
          <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all;">${verificationUrl}</p>
          <p>This verification link will expire in 24 hours.</p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  async sendResetPasswordEmail(email, tempPassword) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Temporary Password - Fitness Tracking',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a4a4a;">Password Reset Request</h2>
          <p>You have requested a password reset for your Fitness Tracking account.</p>
          <p>Your temporary password is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <strong style="font-size: 18px; font-family: monospace; color: #333;">${tempPassword}</strong>
          </div>
          <p><strong>Important:</strong></p>
          <ul>
            <li>This temporary password will expire in 24 hours</li>
            <li>You will be required to change your password after logging in</li>
            <li>For security reasons, please change your password immediately after logging in</li>
          </ul>
          <p>If you did not request this password reset, please ignore this email.</p>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Reset password email sent:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending reset password email:', error);
      return false;
    }
  }

  async sendTestEmail(to) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: to || process.env.EMAIL_USER,
      subject: 'Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a4a4a;">Fitness Tracking Email Test</h2>
          <p>This is a test email to confirm your email configuration is working correctly.</p>
          <p>Details:</p>
          <ul>
            <li>Service: ${process.env.EMAIL_SERVICE}</li>
            <li>From: ${process.env.EMAIL_FROM}</li>
            <li>Sent at: ${new Date().toLocaleString()}</li>
          </ul>
        </div>
      `
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Test email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending test email:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
