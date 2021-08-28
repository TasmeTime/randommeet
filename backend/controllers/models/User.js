const dbConnect = require("../../database/use_db");

const userModel = require("../../database/models/user.model");
const sessionModel = require("../../database/models/session.model");
const conversationModel = require("../../database/models/conversations.model");

class User {
  constructor(usr) {
    if (usr) {
      this.Id = usr._id.toString() || null;
      this.Username = usr.Username || null;
      this.Password = usr.Password || null;
      this.Status = usr.Status || null;
      this.SocketId = usr.SocketId || null;
    }
  }

  static async getByUsername(username) {
    if (!username) return null;
    await dbConnect();
    const user = await userModel.findOne({ Username: username }).exec();
    if (user) return new User(user);
    else return null;
  }

  static async getById(id) {
    await dbConnect();
    const user = await userModel.findOne({ _id: id }).exec();
    if (user) return new User(user);
    else return null;
  }

  static async getSocketIdById(Id) {
    if (!Id) return null;
    try {
      await dbConnect();
      const user = await userModel.findOne({ _id: Id }, { SocketId: 1 }).exec();
      if (user) return user.SocketId;
      else return null;
    } catch (err) {
      console.log("USER_getSocketIdById_error: ", err);
      return null;
    }
  }

  static async getByToken(token) {
    if (!token) return null;
    await dbConnect();
    const session = await sessionModel.findOne({ Token: token, Valid: true });
    if (session) {
      return this.getById(session.UserId);
    } else return null;
  }

  static async updateSocketIdByToken(token, socketId) {
    await dbConnect();
    const u = await this.getByToken(token);
    const res = await userModel
      .findOneAndUpdate({ _id: u.Id }, { SocketId: socketId })
      .exec();
    if (res) return true;
    else return false;
  }

  static async updateSocketIdById(id, socketId) {
    await dbConnect();
    const u = await this.getById(id);
    const res = await userModel
      .findOneAndUpdate({ _id: u.Id }, { SocketId: socketId })
      .exec();
    if (res) return true;
    else return false;
  }

  async updateSocketId(socketId) {
    await dbConnect();
    const res = await userModel
      .findOneAndUpdate({ _id: this.Id }, { SocketId: socketId })
      .exec();
    if (res) return true;
    else return false;
  }

  async getConversations() {
    if (!this.Id) {
      console.log("user class is empty");
      return [];
    }
    await dbConnect();
    const convoList = await conversationModel
      .aggregate([
        {
          $match: {
            "Between.UserId": this.Id,
          },
        },
      ])
      .exec();

    let cl = [];

    for (const convo of convoList) {
      if (convo.Messages.length > 0) {
        const _with = convo.Between.find((u) => u.UserId != this.Id);
        const isOnline = await User.getSocketIdById(_with.UserId);

        let tmp = {
          With: _with,
          LastMessage: convo.Messages.pop(),
          ConversationId: convo._id,
          IsOnline: isOnline ? true : false,
        };
        cl.push(tmp);
      }
    }

    return cl;
  }

  async getMessagesWith(userId) {
    if (!this.Id) {
      console.log("user class is empty");
      return null;
    }
    if (!userId) return null;
    await dbConnect();
    const convoList = await conversationModel
      .aggregate([
        {
          $match: {
            $and: [
              {
                "Between.UserId": this.Id,
              },
              {
                "Between.UserId": userId,
              },
            ],
          },
        },
        {
          $project: {
            Messages: 1,
          },
        },
      ])
      .exec();
    if (convoList && convoList?.length > 0) {
      return convoList[0].Messages;
    } else return null;
  }
}
module.exports = User;
