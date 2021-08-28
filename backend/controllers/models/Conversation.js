const dbConnect = require("../../database/use_db");
const convoModel = require("../../database/models/conversations.model");
const messageModel = require("../../database/models/message.model");
const User = require("./User");
const conversationsModel = require("../../database/models/conversations.model");

class Conversation {
  constructor(convo) {
    if (convo) {
      this.Id = convo._id.toString() || null;
      this.Between = convo.Between || [];
      this.Messages = convo.Messages || [];
      this.StartedUserId = convo.StartedUserId || null;
    }
  }

  static async getById(Id) {
    if (!Id) return null;
    try {
      await dbConnect();
      return await convoModel.findOne({ _id: Id }).exec();
    } catch (err) {
      console.log("CONVO_getById_error: ", err);
      return null;
    }
  }

  static async getUserConversations(UserId) {
    if (!UserId) return [];
    try {
      await dbConnect();
      const ss = await convoModel
        .aggregate([
          {
            $match: {
              "Between.UserId": UserId + "",
            },
          },
        ])
        .exec();
      return ss;
    } catch (err) {
      console.log("CONVO_getUserConversations_error: ", err);
      return [];
    }
  }

  static async conversationExist(UserId, UserId2) {
    if (!UserId || !UserId2) return null;
    try {
      await dbConnect();
      let res = null;
      const convo = await this.getUserConversations(UserId);
      if (convo.length <= 0) return res;

      convo.forEach((c) => {
        const r = c.Between.find((u) => u.UserId === UserId2);
        if (r) {
          res = c._id.toString();
          return;
        }
      });

      return res;
    } catch (err) {
      console.log("CONVO_conversationExist_error: ", err);
      return null;
    }
  }

  async addMessage(Msg, ConvoId = this.Id) {
    if (!Msg.Message || !Msg.SenderId || !Msg.SendDate) return null;
    try {
      dbConnect();
      let msgModel = new messageModel({
        Message: Msg.Message,
        SendDate: Msg.SendDate,
        SenderId: Msg.SenderId,
      });

      const res = await convoModel
        .findOneAndUpdate(
          { _id: ConvoId },
          {
            $push: { Messages: msgModel },
          }
        )
        .exec();

      if (res.errors) return null;
      else return msgModel._id.toString();
    } catch (err) {
      console.log("CONVO_addNewMsgToConversation_error: ", err);
      return null;
    }
  }

  static async addNewMsgToConversation(Msg, ConvoId) {
    if (!ConvoId || !Msg) return null;
    try {
      dbConnect();
      let msgModel = new messageModel({
        Message: Msg.Message,
        SendDate: Msg.SendDate,
        SenderId: Msg.SenderId,
      });

      const res = await convoModel
        .findOneAndUpdate(
          { _id: ConvoId },
          {
            $push: { Messages: msgModel },
          }
        )
        .exec();

      if (res.errors) return null;
      else return msgModel._id.toString();
    } catch (err) {
      console.log("CONVO_addNewMsgToConversation_error: ", err);
      return null;
    }
  }

  static async newConversation(u1, u2) {
    if (!u1 || !u2) return null;
    try {
      let ncm = conversationsModel({
        Between: [
          { UserId: u1.id, Username: u1.username },
          { UserId: u2.id, Username: u2.username },
        ],
        Messages: [],
        StartedUserId: u1.id,
      });

      const res = await ncm.save();
      if (res) return res.id;
      else return null;
    } catch (err) {
      console.log("CONVO_newConversation_error: ", err);
      return null;
    }
  }
}

module.exports = Conversation;
