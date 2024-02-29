const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const axios = require('axios');

router.use(bodyParser.json());

// Webhook verification endpoint
router.get('/', (req, res) => {
    const VERIFY_TOKEN = "WEBHOOK_VERIFY_TOKEN";

    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Webhook callback endpoint
router.post('/', (req, res) => {
    let body = req.body;
    console.log(body.object);

    if (body.object === 'page') {
        body.entry.forEach(entry => {
            let webhookEvent = entry.messaging[0];
            console.log(webhookEvent);

            // Get the sender PSID
            let senderPsid = webhookEvent.sender.id;

            // Handle messages and postbacks
            if (webhookEvent.message) {
                handleMessage(senderPsid, webhookEvent.message);
            } else if (webhookEvent.postback) {
                handlePostback(senderPsid, webhookEvent.postback);
            }     // Process incoming messages
            if (webhookEvent.message && webhookEvent.sender) {
              saveMessage(webhookEvent)
                .then(() => {
                  console.log("Message saved successfully");
                })
                .catch((error) => {
                  console.error("Error saving message:", error);
                });
            }
        });
    


        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Function to save incoming message to the database
async function saveMessage(webhookEvent) {
    const newMessage = new Message({
      fbConversationId: webhookEvent.sender.id,
      messageId: webhookEvent.message.mid,
      messageContent: webhookEvent.message.text,
      senderId: webhookEvent.sender.id,
      timestamp: new Date(webhookEvent.timestamp),
    });
  
    await newMessage.save();
  }

// Handle incoming messages
function handleMessage(senderPsid, receivedMessage) {
    let response;

    if (receivedMessage.text) {
        response = {
            'text': `You sent the message: '${receivedMessage.text}'. Now send me an attachment!`
        };
    } else if (receivedMessage.attachments) {
        // Handle attachments if needed
    }

    callSendAPI(senderPsid, response);
}

// Handle postback events
function handlePostback(senderPsid, receivedPostback) {
    let response;

    let payload = receivedPostback.payload;

    if (payload === 'yes') {
        response = { 'text': 'Thanks!' };
    } else if (payload === 'no') {
        response = { 'text': 'Oops, try sending another image.' };
    }

    callSendAPI(senderPsid, response);
}

// Send response messages via the Send API
async function callSendAPI(senderPsid, response) {
    let requestBody = {
        'recipient': {
            'id': senderPsid
        },
        'message': response
    };

    try {
        await axios.post('https://graph.facebook.com/v2.6/me/messages', requestBody, {
            params: { 'access_token': 'EAAPaHpxKGREBO8AdmphWwoZCVKQs3GwKeCxCODZAqid27D1HXK3lOlF9deAOy104iz8naXX7zYQt7hNNEl3xOEtnwDZBW5cTz0NPXbczT7AjLm0fETHFGbyzkHrLXvknEInY0Qpfzx8PN0QeZCAjaCmRrofclHSL6We9UFor2Sh7aGdQNoHAoxI62y6mTlqYaragYvqB' }
        });
        console.log('Message sent successfully');
    } catch (error) {
        console.error('Unable to send message:', error.message);
    }
}

module.exports = router;
