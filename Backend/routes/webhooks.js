require("dotenv").config();
const express = require("express");
const router = express.Router();

// GET /messaging-webhook - Facebook webhook verification endpoint
router.get("/messaging-webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      return res.status(200).send(challenge);
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      return res.sendStatus(403);
    }
  } else {
    // Respond with '400 Bad Request' if mode or token is missing
    return res.sendStatus(400);
  }
});

// GET / - Facebook webhook subscription endpoint
router.get("/webhook", (req, res) => {
  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

  // Parse the query params
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403).send("Failed to subscribe");
  }
});

// POST / - Facebook webhook callback endpoint
router.post("/webhook", (req, res) => {
  let body = req.body;

  if (body.object === "page") {
    body.entry.forEach((entry) => {
      let webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      // Assuming you receive message events
      if (webhookEvent.message && webhookEvent.sender) {
        // Additional logic might be needed to find or create the corresponding Conversation
        const newMessage = new Message({
          // conversationId: Some logic to find or create the conversation,
          fbConversationId: webhookEvent.sender.id, // Adjust according to your needs
          messageId: webhookEvent.message.mid,
          messageContent: webhookEvent.message.text,
          senderId: webhookEvent.sender.id,
          timestamp: new Date(webhookEvent.timestamp),
        });

        newMessage.save()
          .then(() => console.log("Message saved:", newMessage))
          .catch((error) => console.error("Error saving message:", error));
      }
    });

    return res.status(200).send("EVENT_RECEIVED");
  } else {
    return res.sendStatus(404);
  }
});

module.exports = router;
