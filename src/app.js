const express = require("express");
const session = require("express-session");
const handleError = require("./utils/errorHandler");
const bodyParser = require("body-parser");
const http = require("http");
const userRouter = require("./user/user.router");
const socketSetup = require("./ws-server/socket");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const sessionMiddleware = session({
  secret: "cardgame",
  resave: true,
  saveUninitialized: true,
});

app.use(sessionMiddleware);

socketSetup(server, sessionMiddleware);

app.use("/", userRouter);

app.use(handleError);

server.listen(3000, () => {
  console.log("Server is running on port 3000");
});
