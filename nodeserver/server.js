// server.js

const express = require("express");
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(8000, {
  cors: {
    origin: "*",
  },
});
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
debug: true,
});

const users = {};

app.use("/peerjs", peerServer);
app.use(express.static("public"));
app.get("/", (req, res) => {
res.redirect(`/${uuidv4()}`);
});
app.get("/:room", (req, res) => {
res.render("room", { roomId: req.param.room });
});


io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    });
  socket.on("new-user-joined", (name) => {
    // console.log("New user", name);
    users[socket.id] = name;
    socket.broadcast.emit("user-joined", name);
  });
  socket.on("send", (message) => {
    socket.broadcast.emit("receive", {
      message: message,
      name: users[socket.id],
    });
  });
  socket.on("disconnect", (message) => {
    socket.broadcast.emit("left", users[socket.id]);
    delete users[socket.id];
  });
});
server.listen(8000);
