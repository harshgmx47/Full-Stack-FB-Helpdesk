



import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatDistance } from "date-fns";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../../config";
import ChatUi from "../Elements/ChatUi/ChatUi";
import UserDetails from "../Elements/UserDetails/UserDetails";
import "./messenger.css";
import { useUser } from '../FbIntegration/UserContext'; // Import useUser hook


const POLL_INTERVAL = 1000 * 5;

const Messenger = () => {
  const params = useParams();
  const pageId = params.pageId;
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const { fetchedUserInfo  } = useUser(); // Access userState using useUser hook


  console.log(messages);

  // Function to fetch messages for a given conversation
  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}conversations/${conversationId}/messages`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Function to handle conversation selection
  const handleConversationClick = async (conversationId) => {
    const selected = conversations.find(
      (conv) => conv.conversationId === conversationId
    );
    setSelectedConversation(selected);

    // Fetch messages for the selected conversation
    await fetchMessages(conversationId);

    // Update user details
    setUserDetails({
      name: selected.initiatorName,
      userType: selected.senderType, // Added senderType
    });
  };

  // Effect to fetch conversations on component mount and selectedConversation change
  useEffect(() => {
    const fetchConversations = async () => {
      console.log("clicked");
      try {
        const response = await axios.get(
          `${BASE_URL}pages/${pageId}/conversations`,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setConversations(response.data.conversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };
    fetchConversations();
  }, [pageId]);

  // Polling for new messages
  useEffect(() => {
    const pollInterval = setInterval(() => {
      if (selectedConversation) {
        fetchMessages(selectedConversation.conversationId);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(pollInterval);
  }, [selectedConversation]);

  // Function to update messages after a new message is sent
  const handleMessageSent = (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  // const currentUserId = "122094841628231937"; // Replace with the actual current user ID
  const currentUserId =   fetchedUserInfo.userFacebookId;
  console.log("From Provider"+ fetchedUserInfo.userFacebookId)
  

  return (
    <section className="messengerSec">
      <div className="sec1 navbar">
        {/* Navigation bar */}
        <ul className="navList">
          <li className="link">
            <span className="material-symbols-outlined navIcons">home</span>
          </li>
          <li className="link selected">
            <span className="material-symbols-outlined navIcons">inbox</span>
          </li>
          <li className="link">
            <span className="material-symbols-outlined navIcons">group</span>
          </li>
          <li className="link">
            <span className="material-symbols-outlined navIcons">query_stats</span>
          </li>
        </ul>
      </div>
      <div className="sec2 allConversations">
        {/* Conversation list */}
        <div className="heading">
          <span className="material-symbols-outlined">menu_open</span>
          <p>Conversations</p>
          <span className="material-symbols-outlined refresh">refresh</span>
        </div>
        <div className="conversationsList">
          {conversations.map((conv) => (
            <div
              key={conv.conversationId}
              className={`${
                selectedConversation &&
                selectedConversation.conversationId === conv.conversationId
                  ? "selected"
                  : ""
              } head`}
              onClick={() => handleConversationClick(conv.conversationId)}
            >
              <div className="nameDetails">
                <input type="checkbox" />
                <p>{conv.initiatorName}</p>
                <span >
                  {formatDistance(
                    new Date(conv.lastMessageTimestamp),
                    new Date(),
                    { addSuffix: true }
                  )}
                </span>
              </div>
              <div className="lastMsg">
                <p>Message : {conv.lastMessage}...</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="sec3 conversations">
        {selectedConversation ? (
          <>
            <ChatUi
              name={selectedConversation.initiatorName}
              messages={messages}
              senderId={currentUserId}
              onMessageSent={handleMessageSent}
            />
          </>
        ) : (
          <div className="no-messages">Select the Conversations To begin</div>
        )}
      </div>
      <div className="sec4 userDetails">
        {userDetails ? (
          <>
            <UserDetails name={selectedConversation.initiatorName} />
            
          </>
        ) : (
          <div className="no-details">No Details</div>
        )}
      </div>
    </section>
  );
};

export default Messenger;

