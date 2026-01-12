const mongoose = require("mongoose");
const { Schema } = mongoose;

// Notification Schema
const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["follow", "like", "comment","message"], required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", default: null },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
