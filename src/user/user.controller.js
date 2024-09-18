const User = require("../models/user.model");
const path = require("path");
const pool = require("../db/db");
const { sendPasswordReminderEmail } = require("../services/emailService");

async function registerUser(req, res) {
  const { login, password, confirm_password, full_name, email_address } =
    req.body;

  if (password !== confirm_password) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    const newUser = new User(login, password, full_name, email_address, pool);
    await newUser.saveToDatabase();

    return res.redirect("/registered");
  } catch (err) {
    console.error("Error registering user:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function loginUser(req, res) {
  const { login, password } = req.body;

  try {
    const user = await User.findUserByLoginAndPassword(login, password, pool);
    if (user) {
      req.session.loggedIn = true;
      req.session.user = user;
      res.sendFile(path.join(__dirname, "../../views/main-menu.html"));
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findUserByEmail(email, pool);
    if (user) {
      sendPasswordReminderEmail(email, user.password);
      res
        .status(200)
        .json({ message: "Password reminder sent to your email." });
    } else {
      res.status(400).json({ error: "Email not found." });
    }
  } catch (err) {
    console.error("Error finding user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

function logoutUser(req, res) {
  req.session.destroy(() => {
    res.redirect("/");
  });
}

async function getUserInfo(req, res) {
  if (!req.session.loggedIn) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = req.session.user.login;

  try {
    const [results] = await pool.query(
      "SELECT login, avatar_path FROM users WHERE login = ?",
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results[0]);
  } catch (error) {
    console.error("Database query error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

function uploadAvatar(req, res) {
  const username = req.session.user.login;
  const avatarPath = req.file.filename;
  const updateQuery = "UPDATE users SET avatar_path = ? WHERE login = ?";

  pool.query(updateQuery, [avatarPath, username], (err) => {
    if (err) {
      console.error("Error updating avatar in database", err);
      return res.status(500).json({ message: "Error updating avatar" });
    }

    res.sendFile(path.join(__dirname, "../../views/main-menu.html"));
  });
}

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  logoutUser,
  getUserInfo,
  uploadAvatar,
};
