const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const UserFacebookSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  facebookUserId: { type: String, required: true, unique: true },
  longLivedAccessToken: { type: String, required: true },
});

const PageSchema = new mongoose.Schema({
  userFacebookId: { type: mongoose.Schema.Types.ObjectId, ref: "UserFacebook" },
  pageId: { type: String, required: true },
  pageName: { type: String, required: true },
  pageAccessToken: { type: String, required: true },
});

const ConversationSchema = new mongoose.Schema({
  pageId: { type: mongoose.Schema.Types.ObjectId, ref: "Page" },
  conversationId: { type: String, required: true, unique: true },
  initiatorName: { type: String, required: true },
  initiatorFacebookId: { type: String, required: true },
  lastMessage: { type: String, required: true },
  lastMessageTimestamp: { type: Date, required: true },
});

const MessageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  fbConversationId: { type: String, required: true }, // ID of the conversation on Facebook
  messageId: { type: String, required: true, unique: true }, // Unique identifier for the message
  messageContent: { type: String, required: true }, // Content of the message
  senderId: { type: String, required: true }, // ID of the sender (agent or Facebook user)
  senderType: { type: String, enum: ['agent', 'user'], required: true }, // Type of the sender
  timestamp: { type: Date, required: true }, // Timestamp of the message
});

module.exports = {
  User: mongoose.model("User", UserSchema),
  UserFacebook: mongoose.model("UserFacebook", UserFacebookSchema),
  Page: mongoose.model("Page", PageSchema),
  Conversation: mongoose.model("Conversation", ConversationSchema),
  Message: mongoose.model("Message", MessageSchema),
};
