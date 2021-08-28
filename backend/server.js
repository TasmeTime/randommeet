const express = require("express");
const app = express();
const socket = require("socket.io");
const cors = require("cors");
const Auth = require("./controllers/Auth");
const chat = require("./controllers/chat");

const port = 23021;

app.use(express());
app.use(cors());

var server = app.listen(
  port,
  console.log(`Server is running on the port no: ${port} `)
);

const io = socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  const auth = new Auth(io);
  auth.newConnection(socket);

  socket.on("LOGIN_REQ", (data) => {
    console.log("LOGIN_REQ", data);
    auth.signIn(io, socket, data);
  });

  socket.on("GET_CONVERSATIONS_REQ", (token) => {
    chat.getUserConversations(io, socket, token);
  });

  socket.on("CHAT_NEW_DM", (data) => {
    let sid = auth.getSocketIdByUsername(data.target);
    chat.newDirectMessage(io, socket, data, sid);
  });

  socket.on("disconnect", (data) => {
    console.log("DISCONECT", data);
    auth.disconnect(socket.id);
  });

  socket.on("USER_NEW_STATUS", (data) => {
    chat.userNewStatus(socket, data);
  });

  socket.on("GET_USER_FOR_CHAT_REQ", (data) => {
    auth.getUserForChat(socket.id, data);
  });
  // socket.on("disconnecting", (data) => {
  //   console.log("DISCONECTING", data);
  //   auth.disconnecting(socket.id);
  // });
  // controllers.newConnection(io, socket);
});
