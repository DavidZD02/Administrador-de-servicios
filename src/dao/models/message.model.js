import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    user: { type: String, required: true },
    message: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const MessageModel =
  mongoose.models.messages || mongoose.model("messages", messageSchema);

export default MessageModel;
