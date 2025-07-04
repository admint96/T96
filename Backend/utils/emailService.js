const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});


async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: `"Talent96" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #121212; color: white; padding: 30px; border-radius: 10px; text-align: center; max-width: 500px; margin: auto;">
        <h2 style="color: #d291fa;">Email Verification</h2>
        <p>Thank you for using <strong>Talent96</strong>.</p>
        <p>Your OTP is:</p>
        <h1 style="color: #d291fa;">${otp}</h1>
        <p>This OTP is valid for <strong>3 minutes</strong>.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br/>
        <p style="color: gray;">Regards,<br>Talent96 Team</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(' OTP email sent:', info.messageId);
  } catch (err) {
    console.error(' Failed to send OTP email:', err);
    throw err;
  }
}


async function sendPasswordChangeEmail(to, name) {
  const mailOptions = {
    from: `"Talent96" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Password Changed Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 30px; border-radius: 10px; max-width: 500px; margin: auto;">
        <div style="text-align: center;">
         
          <h2 style="color: #4A00E0;">Password Change Notification</h2>
        </div>

        <p>Dear <strong>${name || 'User'}</strong>,</p>
        <p>Your account password was changed successfully.</p>
        <p>If this was not you, please <a href="mailto:support@talent96.com">contact our support team</a> immediately.</p>

        <br/>
        <p>Thank you,<br><strong>Talent96 Team</strong></p>

        <hr style="margin-top: 40px;" />
        <p style="font-size: 12px; color: #888; text-align: center;">
          © ${new Date().getFullYear()} Talent96. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(' Password change confirmation email sent:', info.messageId);
  } catch (err) {
    console.error(' Failed to send password change confirmation email:', err);
    throw err;
  }
}


async function sendPasswordResetCodeEmail(to, code) {
  const mailOptions = {
    from: `"Talent96" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset Your Password - Code Inside',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #ffffff; padding: 30px; border-radius: 10px; max-width: 500px; margin: auto;">
        <div style="text-align: center;">
          <h2 style="color: #d291fa;">Password Reset Request</h2>
        </div>

        <p>Hello,</p>
        <p>We received a request to reset your password. Use the code below to reset it:</p>

        <h1 style="text-align: center; background: #f1f1f1; padding: 10px 20px; border-radius: 8px;">${code}</h1>

        <p>This code will expire in <strong>10 minutes</strong>.</p>
        <p>If you didn't request this, please ignore the email.</p>

        <br/>
        <p>Thanks,<br><strong>Talent96 Team</strong></p>

        <hr style="margin-top: 40px;" />
        <p style="font-size: 12px; color: #888; text-align: center;">
          © ${new Date().getFullYear()} Talent96. All rights reserved.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(' Password reset code email sent:', info.messageId);
  } catch (err) {
    console.error(' Failed to send password reset code email:', err);
    throw err;
  }
}

module.exports = {
  sendOtpEmail,
  sendPasswordChangeEmail,
  sendPasswordResetCodeEmail, 
};
