const User = require("./models/user");
const nodemailer = require("nodemailer");

function registerUserAndSaveToDatabase(
  login,
  password,
  full_name,
  email_address,
  db,
  callback
) {
  const newUser = new User(login, password, full_name, email_address, db);
  newUser.saveToDatabase((err, result) => {
    if (err) {
      console.error("Database error: " + err);
      callback(err, null);
      return;
    }
    callback(null, "User registered successfully");
  });
}

async function findUserByLoginAndPassword(login, password, db) {
  try {
    const sql = "SELECT * FROM users WHERE login = ? AND password = ?";
    const [results] = await db.query(sql, [login, password]);

    if (results.length === 0) {
      return null;
    } else {
      return results[0];
    }
  } catch (err) {
    console.error("Database error: " + err);
    throw err;
  }
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "",
    pass: "",
  },
});

function sendPasswordReminderEmail(email, password) {
  const mailOptions = {
    from: "",
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
  registerUserAndSaveToDatabase,
  findUserByLoginAndPassword,
  sendPasswordReminderEmail,
};
