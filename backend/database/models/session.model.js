const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const SessionSchema = new Schema(
  {
    UserId: { type: String, required: true },
    Token: { type: String, required: true },
    Info: { type: String, required: true },
    Valid: { type: Boolean, required: true },
    // Role: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Session || mongoose.model("Session", SessionSchema);
