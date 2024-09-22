const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const userController = require("./user.controller");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const destinationPath = path.join("avatars", "/");
    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + "-" + file.originalname;
    cb(null, filename);
  },
});

const upload = multer({ storage: storage });

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/menu.html"));
});
router.get("/registration", (req, res) =>
  res.sendFile(path.join(__dirname, "../../public/registration.html"))
);
router.get("/auth-success", (req, res) =>
  res.sendFile(path.join(__dirname, "../../public/auth-success.html"))
);
router.get("/forgot-password", (req, res) =>
  res.sendFile(path.join(__dirname, "../../public/forgot-password.html"))
);
router.get("/user-status", (req, res) => {
  if (req.session.loggedIn) {
    res.sendFile(path.join(__dirname, "../../public/menu.html"));
  } else {
    res.sendStatus(401);
  }
});
router.get("/logout", userController.logoutUser);
router.get("/user-info", userController.getUserInfo);
router.get("/lobby", (req, res) =>
  res.sendFile(path.join(__dirname, "../../public/lobby.html"))
);

router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/forgot-password", userController.forgotPassword);
router.post("/logout", userController.logoutUser);

router.post(
  "/upload-avatar",
  upload.single("avatar"),
  userController.uploadAvatar
);

module.exports = router;
