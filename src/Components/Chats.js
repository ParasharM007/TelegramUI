
import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CallIcon from '@mui/icons-material/Call';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import Spinner from "./Spinner";

const fetchChatList = async (page = 1) => {
  try {
    const response = await fetch(
      `https://devapi.beyondchats.com/api/get_all_chats?page=${page}`
    );
    const data = await response.json();
    return data?.data?.data.map((chat) => ({
      id: chat.id,
      creator: chat.creator,
    }));
  } catch (error) {
    console.error("Error fetching chat list:", error);
    return [];
  }
};

const fetchChatMessages = async (chatId) => {
  try {
    const response = await fetch(
      `https://devapi.beyondchats.com/api/get_chat_messages?chat_id=${chatId}`
    );
    const data = await response.json();
    return data?.data.map((message) => ({
      id: message.id,
      text: message.message,
      sender: message.sender,
      createdAt: message.created_at,
    }));
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    return [];
  }
};

function Chats() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const chatList = await fetchChatList(page);
      setChats(chatList);
      setLoading(false);
    };

    fetchData();
  }, [page]);

  const handleChatSelect = async (chat) => {
    window.scrollTo(0, 0);
    setLoading(true);
    setSelectedChat(chat);
    const chatMessages = await fetchChatMessages(chat.id);
    setMessages(chatMessages);
    setLoading(false);
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
    window.scrollTo(0, 0);
  };

  const handlePrevPage = () => {
    setPage((prevPage) => (prevPage > 1 ? prevPage - 1 : 1));
    window.scrollTo(0, 0);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return date.toLocaleString(undefined, options);
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: isMobile ? "100%" : "300px",
          borderRight: isMobile ? "none" : "1px solid #ddd",
          borderBottom: isMobile ? "1px solid #ddd" : "none",
        }}
      >
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">Telegram for BeyondChats</Typography>
          </Toolbar>
        </AppBar>
        {loading && <Spinner />}

        <List>
          {chats.map((chat) => (
            <React.Fragment key={chat.id}>
              <ListItem button onClick={() => handleChatSelect(chat)}>
                <ListItemText
                  primary={chat.creator.name || "Anonymous"}
                  secondary={chat.creator.email}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
        <Box sx={{ display: "flex", justifyContent: "space-between", padding: 1 }}>
          <Button
            variant="contained"
            onClick={handlePrevPage}
            disabled={page === 1}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNextPage}
            disabled={page === 10}
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* Chat Area */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Chat Header */}
        {loading && <Spinner />}

        {selectedChat ? (
          <>
            <AppBar position="static" color="default">
              <Toolbar>
                <Typography variant="h6" sx={{flexGrow: 1 }}>
                  {selectedChat.creator.name || "Anonymous"}
                </Typography>
               <CallIcon  sx={{margin:'4px'}}/>
               <VideoCallIcon sx={{margin:'4px'}}/>
               
              </Toolbar>
            </AppBar>

            {/* Chat Messages */}
            <Box className="messages-box2" sx={{ flexGrow: 1, padding: 2, overflowY: "auto" }}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor:
                      message.sender.id === selectedChat.creator.id
                        ? "lightgrey"
                        : "transparent",
                    padding: 1,
                    marginBottom: 1,
                    borderRadius: 1,
                  }}
                >
                  <Box>
                    <strong>{message.sender.name}:</strong> {message.text}
                  </Box>
                  <Typography variant="body2" sx={{ color: "grey" }}>
                    {formatTimestamp(message.createdAt)}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Message Input */}
            <Box
              sx={{
                padding: 2,
                borderTop: "1px solid black",
                display: "flex",
                alignItems: "center",
              }}
            >
              <TextField
                variant="outlined"
                fullWidth
                placeholder="Type a message"
                sx={{ marginRight: 1 }}
              />
              <EmojiEmotionsIcon sx={{margin:'4px'}}/>
              <SendIcon sx={{ color: "rgba(39, 132, 245, 0.8)", margin:'4px' }} />
            </Box>
          </>
        ) : (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Select a chat to start messaging</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Chats;
