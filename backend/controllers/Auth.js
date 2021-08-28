const dbConnect = require("../database/use_db");
const userModel = require("../database/models/user.model");
const User = require("./models/User");
const Convo = require("./models/Conversation");
const Session = require("../database/models/session.model");
const md5 = require("md5");

class Auth {
  constructor(io) {
    if (io) this.io = io;
    this.users = []; //{ username, socketId , token}
  }

  static async ValidateToken(token) {
    // console.log(
    //   await Convo.conversationExist(
    //     "6126327792801c388e76dd57",
    //     "612632ac92801c388e76dd58"
    //   )
    // );

    if (!token) return false;
    try {
      await dbConnect();
      const session = await Session.findOne({
        Token: token,
        Valid: true,
      }).exec();

      if (!session) {
        return false;
      }

      return true;
    } catch (err) {
      console.log(
        "Error while validating the token (" + token + ") err:" + err
      );
      return false;
    }
  }

  async #_logout(token) {
    try {
      if (!(await ValidateToken(token))) return true;

      //get the userId tied to this token
      const session = await Session.findOne(
        {
          Token: token,
        },
        { UserId: 1 }
      ).exec();

      const res = await Session.updateMany(
        { UserId: session.UserId, Valid: true },
        { Valid: false }
      );

      return true;
    } catch (err) {
      console.log("Error whilelogging out token(" + token + ") err:" + err);
      return false;
    }
  }

  async #_login(uname, pass, socketId) {
    if (!uname || !pass) return null;
    try {
      //hash the password
      const enc_pass = md5(pass);
      await dbConnect();

      //check if such user exist
      const user = await userModel
        .findOne({
          Username: uname,
          Password: enc_pass,
        })
        .exec();

      if (!user) {
        return null;
      }

      //generate the token
      const _token = md5(
        "T@SME" + uname + "|" + enc_pass + "|" + Date.now() + "T!ME"
      );

      //disable the previous sessions
      await Session.updateMany(
        { UserId: user._id, Valid: true },
        { Valid: false }
      );

      //insert the session
      const newSession = new Session({
        UserId: user._id,
        Token: _token,
        Info: "SOME INFO",
        Valid: true,
      });

      const saveRes = await newSession.save();
      User.updateSocketIdById(user._id.toString(), socketId);

      this.io.emit("USER_STATUS_CHANGE", {
        StatusType: "ACTIVITY",
        NewStatus: "ONLINE",
        Data: {
          UserId: user._id.toString(),
          UserName: user.Username,
        },
      });

      if (!saveRes) return null;

      return {
        Id: user._id,
        Username: user.Username,
        Status: user.Status,
        Token: _token,
      };
    } catch (err) {
      console.log("Error logging in username(" + uname + ") err:" + err);
      return null;
    }
  }

  async signIn(io, socket, credentials) {
    if (!credentials || !credentials.username || !credentials.password)
      io.to(socket.id).emit("LOGIN_RES", {
        token: null,
        error: "credentials can't be empty",
      });

    const loginRes = await this.#_login(
      credentials.username,
      credentials.password,
      socket.id
    );
    if (loginRes)
      io.to(socket.id).emit("LOGIN_RES", {
        user: loginRes,
        error: null,
      });
    else
      io.to(socket.id).emit("LOGIN_RES", {
        user: null,
        error: "Login Failed!",
      });
  }

  addUser(user) {
    this.users.push(user);
  }

  async newConnection(socket) {
    const t = socket.handshake.auth.token;
    console.log("new connection! from: " + socket.handshake.address, t);
    if (t) {
      //validate token, then update the token in users list
      if (await Auth.ValidateToken(t)) {
        let i = this.users.findIndex((u) => u.token === t);
        if (i && i > 0) {
          console.log("b", this.users);
          this.users[i].socketId = socket.id;
          console.log("a", this.users);
          console.log("updated " + this.users[i].username + "'s socketId");
        } else {
          const usr = await User.getByToken(t);
          let nu = { username: usr.Username, token: t, socketId: socket.id };
          this.addUser(nu);
          await usr.updateSocketId(socket.id);
        }
      }
    } else {
      // addGeust({ socketId: socket.id });
    }
  }

  async disconnect(socketId) {
    await this.removeUser(socketId);
    //set disconnect on db
    //check for socket id and remove it from lists
  }

  async removeUser(socketId) {
    const u = this.users.find((u) => u.socketId === socketId);
    if (u) {
      // const res = await User.updateSocketIdByToken(u.token, null);
      const usr = await User.getByToken(u.token);
      usr.updateSocketId(null);

      this.users = this.users.filter((u) => {
        if (u.socketId !== socketId) true;
      });

      this.io.emit("USER_STATUS_CHANGE", {
        StatusType: "ACTIVITY",
        NewStatus: "OFFLINE",
        Data: {
          UserId: usr.Id,
          UserName: usr.Username,
        },
      });
      console.log("");
    }
  }

  getSocketIdByUsername(username) {
    if (!username) return null;

    const usr = this.users.find((u) => u.username == username);
    if (usr) return usr.socketId;
    else return null;
  }

  async getUserForChat(socketId, data) {
    if (!data || !data?.Token || !data?.Username) {
      this.io.to(socketId).emit("GET_USER_FOR_CHAT_RES", {
        user: null,
        error: "Invalid Request",
      });
      return;
    }

    const usr = await User.getByToken(data.Token);
    if (!usr) {
      this.io.to(socketId).emit("GET_USER_FOR_CHAT_RES", {
        user: null,
        error: "Authentication failed!",
      });
      return;
    }

    const target = await User.getByUsername(data.Username);

    const msg = await usr.getMessagesWith(target.Id);

    if (target) {
      this.io.to(socketId).emit("GET_USER_FOR_CHAT_RES", {
        user: {
          Username: target.Username,
          Id: target.Id,
          Messages: msg ? msg : [],
          IsOnline: target.SocketId ? true : false,
        },
        error: null,
      });
    } else {
      this.io.to(socketId).emit("GET_USER_FOR_CHAT_RES", {
        user: null,
        error: "User Not Found :(",
      });
    }
  }
}

module.exports = Auth;
// {
//   users,
//   signIn,
//   ValidateToken,
//   newConnection,
//   disconnect,
//   getSocketIdByUsername,
// };
