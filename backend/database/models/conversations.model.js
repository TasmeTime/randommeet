const mongoose = require("mongoose");
const Message = require("./message.model");
const Schema = mongoose.Schema;

const ConversationSchema = new Schema(
  {
    Between: [
      {
        UserId: { type: String, required: true },
        Username: { type: String, required: true },
      },
    ],
    Messages: [Message.schema],
    StartedUserId: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Conversation ||
  mongoose.model("Conversation", ConversationSchema);
