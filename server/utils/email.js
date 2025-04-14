const nodemailer = require('nodemailer');

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    console.error('Error with mail config:', error);
  } else {
    console.log('Server is ready to send emails');
  }
});

// Export functions
exports.sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/auth/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `"DietAI" <${process.env.EMAIL_USERNAME}>`,
    to: email,
    subject: 'Verify Your Email',
    html: `
      <h2>Welcome to DietAI!</h2>
      <p>Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        text-decoration: none;
        border-radius: 5px;
      ">Verify Email</a>
      <p>If you didn't create an account, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

// Export transporter for testing
exports.transporter = transporter;