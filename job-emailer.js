require('dotenv').config();
const nodemailer = require('nodemailer');

// Configure transporter with gmail OAuth2
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASSWORD,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    },
});


const sendEmail = (textContent) => 
{
    // Configure the receiver and sender
    const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: process.env.RECEIVER_EMAIL,
        subject: 'Job Emailer Project',
        text: textContent,
        attachments: [{
            path: './JobReport.xlsx'
        }]
    };

    // Send Email
    transporter.sendMail(mailOptions, function(err, data) 
    {
        if (err)
          console.log("Error " + err);
        else
          console.log("Email sent successfully");
    });
}

module.exports = { sendEmail };