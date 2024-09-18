const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-email-password",
  },
});

function sendPasswordReminderEmail(email, password) {
  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "Password Reminder",
    text: `Your password is: ${password}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Email sending error: " + error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

module.exports = {
  sendPasswordReminderEmail,
};
