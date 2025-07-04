
const nodemailer = require('nodemailer');

const sendEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Talent96" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: auto; background-color: #f9f9f9; border-radius: 10px;">
        <div style="text-align: center;">
          <h2 style="color: #4A00E0;">Email Verification</h2>
        </div>

        <p>Hello,</p>
        <p>Thank you for using <strong>Talent96</strong>.</p>
        <p>Your One-Time Password (OTP) is:</p>
        <h1 style="text-align: center; color: #4A00E0;">${otp}</h1>
        <p style="text-align: center; color: #666;">This OTP is valid for <strong>3 minutes</strong>.</p>

        <p>If you did not request this, please ignore this email.</p>

        <br />
        <p style="font-size: 14px; color: #888;">Regards,</p>
        <p style="font-size: 14px; color: #888;">Talent96 Team</p>

        <hr style="margin-top: 30px;" />
        <p style="font-size: 12px; color: #bbb; text-align: center;">
          © ${new Date().getFullYear()} Talent96. All rights reserved.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
