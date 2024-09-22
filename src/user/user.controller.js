const User = require("../models/user.model");
const path = require("path");
const pool = require("../db/db");
const catchAsync = require("../utils/catchAsync");
const sendPasswordReminderEmail = require("../services/emailService");

const registerUser = catchAsync(async (req, res, next) => {
  const { login, password, confirm_password, full_name, email_address } =
    req.body;

  if (password !== confirm_password) {
    return next(new Error("Passwords do not match"));
  }

  const newUser = new User(login, password, full_name, email_address, pool);
  await newUser.saveToDatabase();
  return res.redirect("/auth-success");
});

const loginUser = catchAsync(async (req, res, next) => {
  const { login, password } = req.body;

  const user = await User.findUserByLoginAndPassword(login, password, pool);
  if (user) {
    req.session.loggedIn = true;
    req.session.user = user;
    return res.sendFile(path.join(__dirname, "../../public/menu.html"));
  }
  return next(new Error("Unauthorized"));
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findUserByEmail(email, pool);
  if (user) {
    sendPasswordReminderEmail(email, user.password);
    return res
      .status(200)
      .json({ message: "Password reminder sent to your email." });
  }
  return next(new Error("Email not found."));
});

const logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};

const getUserInfo = catchAsync(async (req, res, next) => {
  if (!req.session.loggedIn) {
    return next(new Error("Unauthorized"));
  }

  const userId = req.session.user.login;
  const [results] = await pool.query(
    "SELECT login, avatar_path FROM users WHERE login = ?",
    [userId]
  );

  if (results.length === 0) {
    return next(new Error("User not found"));
  }

  return res.json(results[0]);
});

const uploadAvatar = (req, res, next) => {
  const username = req.session.user.login;
  const avatarPath = req.file.filename;

  pool.query(
    "UPDATE users SET avatar_path = ? WHERE login = ?",
    [avatarPath, username],
    (err) => {
      if (err) {
        return next(
          new Error("Error updating avatar in database: " + err.message)
        );
      }
      return res.sendFile(path.join(__dirname, "../../public/menu.html"));
    }
  );
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  logoutUser,
  getUserInfo,
  uploadAvatar,
};
