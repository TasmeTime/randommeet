const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    Username: { type: String, required: true, unique: true },
    Password: { type: String, required: true },
    Status: { type: String, required: true, default: "Offline" },
    SocketId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
