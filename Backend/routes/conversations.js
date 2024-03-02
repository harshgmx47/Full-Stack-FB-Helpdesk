const express = require("express");
const { Message, Conversation, Page } = require("../model");
const router = express.Router();
const axios = require("axios");
const authenticateUser = require("../middleware/auth");

router.get("/:conversationId/messages", authenticateUser, async (req, res) => {
  const conversationId = req.params.conversationId; // actual stirng id

  try {
    const messages = await Message.find({
      fbConversationId: conversationId,
    }).sort({
      timestamp: 1,
    });
    // .select("messageContent senderType timestamp"); // if we need specific fields
    if (messages.length === 0) {
      res.json({ message: "No messages found" });
    }
    // console.log(messages);
    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("An error occurred while fetching messages.");
  }
});

router.post("/:conversationId/send", authenticateUser, async (req, res) => {
  const conversationId = req.params.conversationId; //object id
  const { messageContent } = req.body;

  try {
    const conversation = await Conversation.findById(conversationId).populate({
      path: "pageId",
      populate: { path: "userFacebookId" },
    });

    if (!conversation) {
      return res.status(404).send("Conversation not found.");
    }

    const pageAccessToken = conversation.pageId.pageAccessToken;

    if (!pageAccessToken) {
      return res.status(500).send("Page access token not found.");
    }

    const sendMessageUrl = `https://graph.facebook.com/v19.0/me/messages`;

    const recipientId = conversation.initiatorFacebookId;

    const response = await axios.post(
      sendMessageUrl,
      {
        recipient: { id: recipientId },
        message: { text: messageContent },
      },
      {
        headers: { Authorization: `Bearer ${pageAccessToken}` },
      }
    );
      // Determine sender type based on conversation data
      const senderType = "agent"; // Assume the sender is always the agent if it's not the recipient

     // If message sent successfully, save it in the database
    if (response.data && response.data.message_id) {
      const newMessage = new Message({
        conversationId: conversation._id,
        fbConversationId: conversation.conversationId,
        messageId: response.data.message_id,
        messageContent,
        senderType,
        senderId: conversation.pageId.pageId,
        timestamp: new Date(),
      });

      await newMessage.save();
      res.status(201).json(newMessage);
    } else {
      throw new Error("Failed to send message via Facebook Graph API");
    }
  } catch (error) {
    console.error("Error sending message:", error.message);
    res
      .status(500)
      .json({ message: "An error occurred while sending the message." });
  }
});

module.exports = router;
