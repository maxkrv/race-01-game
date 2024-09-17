const User = require("../models/user");
const path = require("path");
const pool = require("../db/db");
const {
  findUserByLoginAndPassword,
  sendPasswordReminderEmail,
  registerUserAndSaveToDatabase,
} = require("../model");

async function registerUser(req, res) {
  const { login, password, confirm_password, full_name, email_address } =
    req.body;

  if (password !== confirm_password) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  try {
    await registerUserAndSaveToDatabase(
      login,
      password,
      full_name,
      email_address,
      pool
    );

    return res.redirect("/registered");
  } catch (err) {
    console.error("Error registering user:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

async function loginUser(req, res) {
  console.log("Login request received");
  const { login, password } = req.body;
  console.log("Login data:", login, password);

  try {
    const user = await findUserByLoginAndPassword(login, password, pool);
    console.log("User found:", user);
    if (user) {
      req.session.loggedIn = true;
      req.session.user = user;
      console.log("User logged in:", req.session.user);
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

  const user = new User();
  user.findUserByEmail(email, pool, (err, user) => {
    if (user) {
      sendPasswordReminderEmail(email, user.password);
      res
        .status(200)
        .json({ message: "Password reminder sent to your email." });
    } else {
      res.status(400).json({ error: "Email not found." });
    }
  });
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
      "SELECT login, avatar_path FROM cards_web.users WHERE login = ?",
      [userId]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results[0]);
  } catch (error) {
    console.error("Ошибка запроса к базе данных:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

function uploadAvatar(req, res) {
  const username = req.session.user.login;
  const avatarPath = req.file.filename;
  const updateQuery =
    "UPDATE cards_web.users SET avatar_path = ? WHERE login = ?";

  db.query(updateQuery, [avatarPath, username], (err) => {
    if (err) {
      console.error("Ошибка при обновлении аватара в базе данных", err);
      return res.status(500).json({ message: "Ошибка при обновлении аватара" });
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
