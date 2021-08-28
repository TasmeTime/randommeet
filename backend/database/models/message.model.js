const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    Message: { type: String, required: true },
    SendDate: { type: Date, required: true },
    SenderId: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Message || mongoose.model("Message", MessageSchema);
