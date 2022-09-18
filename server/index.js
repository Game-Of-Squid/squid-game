// Initialize server variables
const express = require("express");
const app = express();
const https = require("https");
const http = require("http");
// const fs = require("fs");
// const options = {
//   key: fs.readFileSync("./cert/ia.key"),
//   cert: fs.readFileSync("./cert/server.crt"),
//   ca: fs.readFileSync("./cert/ca.crt"),
// };

// Create HTTPS server
const server = http.createServer(app);
const path = require("path");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// const spawn = require("child_process").spawn;
// let { PythonShell } = require("python-shell");

// Listen to port
const serverPort = process.env.PORT || 3030;
server.listen(serverPort, function () {
  console.log("Started an http server on port " + serverPort);
});
const public = __dirname + "/public/";

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use("/*", function (req, res, next) {
  res.redirect("/");
  next();
});

// Server-client connection architecture
io.on("connection", function (socket) {
  console.log("Connection made", new Date());

  socket.on("angle", (angle) => {
    console.log("Sending angle to serial port");
    port.write(angle);
  });

  socket.on("disconnect", () => {});
});

module.exports = app;
