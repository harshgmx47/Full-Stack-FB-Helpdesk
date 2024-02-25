const express = require("express");
const axios = require("axios"); // Make sure axios is imported
const WebSocket = require("ws");

const router = express.Router();
const { Page, Conversation, Message } = require("../model");
const authenticateUser = require("../middleware/auth");

// WebSocket setup
const wss = new WebSocket.Server({ noServer: true });
// Handle WebSocket connections
wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Connect to the page and fetch conversations
router.get("/:pageId/conversations", authenticateUser, async (req, res) => {
  const { pageId } = req.params;

  try {
    const page = await Page.findOne({ pageId: pageId });
    if (!page) {
      return res.status(404).send("No Conversations found for this Page!");
    }

    const fetchedConversations = await fetchConversations(
      page.pageAccessToken,
      pageId
    );

    // Assuming fetchedConversations now includes the required details
    const savedConversations = await Promise.all(
      fetchedConversations.conversations.map(async (conv) => {
        // Extracting additional details: initiatorName and lastMessage
        const {
          conversationId,
          initiatorName,
          initiatorFacebookId,
          lastMessage,
          lastMessageTimestamp,
        } = conv;

        await fetchAndStoreMessages(page.pageAccessToken, conversationId,pageId);

        const conversation = await Conversation.findOneAndUpdate(
          { conversationId },
          {
            $set: {
              pageId: page._id,
              initiatorName,
              initiatorFacebookId,
              lastMessage,
              lastMessageTimestamp: new Date(lastMessageTimestamp),
            },
          },
          { new: true, upsert: true }
        );

        return conversation;
      })
    );

    res.json({ conversations: savedConversations });
  } catch (error) {
    console.error("Error in conversation fetch/save route:", error);
    res
      .status(500)
      .send("An error occurred while fetching/saving conversations.");
  }
});

// Function to fetch conversations from the Facebook Graph API
async function fetchConversations(pageAccessToken, pageId) {
  try {
    const pageConversationsUrl = `https://graph.facebook.com/v12.0/${pageId}/conversations?fields=participants,messages.limit(1){message,from,created_time}&access_token=${pageAccessToken}`;
    const response = await axios.get(pageConversationsUrl);

    const conversations = response.data.data.map((conv) => {
      const lastMessage = conv.messages.data[0];

      const isLastMessageFromPage = lastMessage.from.id === pageId;
      let initiatorName, initiatorFacebookId;

      if (!isLastMessageFromPage) {
        initiatorName = lastMessage.from.name;
        initiatorFacebookId = lastMessage.from.id;
      } else {
        const recipient = conv.participants.data.find(
          (participant) => participant.id !== pageId
        );
        initiatorName = recipient.name;
        initiatorFacebookId = recipient.id;
      }

      return {
        conversationId: conv.id,
        initiatorName: initiatorName,
        initiatorFacebookId: initiatorFacebookId,
        lastMessage: lastMessage.message,
        lastMessageTimestamp: lastMessage.created_time,
      };
    });

    return { conversations };
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}

async function fetchAndStoreMessages(pageAccessToken, fbConversationId,pageId) {
  try {
    // First, find the corresponding Conversation document in your database
    const conversation = await Conversation.findOne({
      conversationId: fbConversationId,
    });
    if (!conversation) {
      console.log("Conversation not found in DB, skipping message fetch");
      return;
    }

    const messagesUrl = `https://graph.facebook.com/v12.0/${fbConversationId}/messages?access_token=${pageAccessToken}&fields=id,message,from,created_time`;
    const response = await axios.get(messagesUrl);
    const messages = response.data.data;

    await Promise.all(
      messages.map(async (msg) => {
        try {
          // Determine sender type based on senderId and pageId
          const senderType = msg.from.id === pageId ? "agent" : "user";
          console.log("From-Page "+ senderType);
             // Save the message to the database
          await Message.findOneAndUpdate(
            { messageId: msg.id },
            {
              conversationId: conversation._id,
              fbConversationId: conversation.conversationId,
              messageId: msg.id,
              messageContent: msg.message,
              senderId: msg.from.id,
              senderType: senderType,
              timestamp: new Date(msg.created_time),
            },
            { upsert: true, new: true }
          );
        } catch (saveError) {
          console.error("Error saving a message:", saveError);
        }
      })
    );
  } catch (error) {
    console.error("Error fetching or saving messages:", error);
  }
}

module.exports = router;
