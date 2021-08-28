const Auth = require("./Auth");
const auth = new Auth();
const User = require("./models/User");
const Convo = require("./models/Conversation");

async function getUserConversations(io, socket, token) {
  const res = await Auth.ValidateToken(token);

  if (!token || !res)
    io.to(socket.id).emit("GET_CONVERSATIONS_RES", {
      conversations: null,
      error: "Authentication Failed!",
    });

  const user = await User.getByToken(token);
  const convo = await user.getConversations();

  io.to(socket.id).emit("GET_CONVERSATIONS_RES", {
    conversations: convo,
    error: null,
  });
}

async function newDirectMessage(io, socket, data) {
  if (!data || !data.message || !data.target || !data.token) {
    io.to(socket.id).emit("CHAT_NEW_DM_RES", {
      message: null,
      error: "invalid dm req!",
    });
    return;
  }

  //   {
  //   message: 'dqwdq',
  //   target: 'Shahin',
  //   token: '4d62ec46f85cca104c69296cc21a37c7'
  // }

  //insert message in database, send it to target and send it back with ID and time and maybe status to user

  const sender = await User.getByToken(data.token);

  if (!sender) {
    io.to(socket.id).emit("CHAT_NEW_DM_RES", {
      message: null,
      error: "Authentication Failed :(",
    });
    return;
  }

  const target = await User.getByUsername(data.target);
  if (!target) {
    io.to(socket.id).emit("CHAT_NEW_DM_RES", {
      message: null,
      error: "User Not Found :(",
    });
    return;
  }
  let id = sender.Id.toString(),
    id2 = target.Id.toString();

  let convId = await Convo.conversationExist(id, id2);

  if (!convId) {
    //create conversation
    convId = await Convo.newConversation(
      { id, username: sender.Username },
      { id: id2, username: target.Username }
    );
    if (!convId) {
      io.to(socket.id).emit("CHAT_NEW_DM_RES", {
        message: null,
        error: "Error while creating new conversation :/",
      });
      return;
    }
  }

  let msg = {
    Message: data.message,
    SendDate: Date.now(),
    SenderId: id,
  };

  const msgId = await Convo.addNewMsgToConversation(msg, convId);

  if (msgId) {
    msg.Id = msgId;
    io.to(target.SocketId).emit("CONVERSATION_NEW_MSG", {
      message: { ...msg, ConvId: convId, SenderUsername: sender.Username },
    });

    io.to(socket.id).emit("CHAT_NEW_DM_RES", {
      message: msg,
      error: null,
    });
  }
}

async function userNewStatus(socket, data) {
  if (!data) return;
  const t = data?.Data?.Token;
  const usr = await User.getByToken(t);
  if (usr) {
    switch (data.StatusType) {
      case "ACTIVITY":
        switch (data.NewStatus) {
          case "STOP_IS_TYPING":
            socket.broadcast.emit("USER_STATUS_CHANGE", {
              StatusType: "ACTIVITY",
              NewStatus: "STOP_IS_TYPING",
              Data: {
                UserId: usr.Id,
                UserName: usr.Username,
              },
            });
            break;
          case "START_IS_TYPING":
            socket.broadcast.emit("USER_STATUS_CHANGE", {
              StatusType: "ACTIVITY",
              NewStatus: "START_IS_TYPING",
              Data: {
                UserId: usr.Id,
                UserName: usr.Username,
              },
            });
            break;
        }
        break;
      default:
        console.log("invalid status update");
        break;
    }
  }
}

module.exports = {
  getUserConversations,
  newDirectMessage,
  userNewStatus,
};
