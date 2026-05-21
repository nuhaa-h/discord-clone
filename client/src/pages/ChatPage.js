import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { getChannels, createChannel, getMessages } from '../services/api';
import Sidebar from '../components/Sidebar';
import ChatArea from '../components/ChatArea';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

export default function ChatPage() {
  const { user, token, logoutUser } = useAuth();
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef(null);

  // Initialize socket
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user_typing', ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(username) ? prev : [...prev, username];
        } else {
          return prev.filter((u) => u !== username);
        }
      });
    });

    socket.on('connect_error', (err) => {
      console.error('Socket error:', err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Load channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await getChannels();
        setChannels(res.data);
        // Auto-select first channel
        if (res.data.length > 0 && !activeChannel) {
          setActiveChannel(res.data[0]);
        }
      } catch (err) {
        console.error('Failed to load channels:', err);
      }
    };
    fetchChannels();
  }, []);

  // Load messages when channel changes
  useEffect(() => {
    if (!activeChannel) return;

    setMessages([]);
    setTypingUsers([]);
    setLoadingMessages(true);

    // Join socket room
    if (socketRef.current) {
      socketRef.current.emit('join_channel', activeChannel._id);
    }

    // Fetch message history
    getMessages(activeChannel._id)
      .then((res) => setMessages(res.data))
      .catch(console.error)
      .finally(() => setLoadingMessages(false));
  }, [activeChannel]);

  const handleSelectChannel = (channel) => {
    setActiveChannel(channel);
  };

  const handleCreateChannel = async (name, description) => {
    try {
      const res = await createChannel({ name, description });
      setChannels((prev) => [...prev, res.data]);
      setActiveChannel(res.data);
      return null; // no error
    } catch (err) {
      return err.response?.data?.message || 'Failed to create channel';
    }
  };

  const handleSendMessage = (content) => {
    if (!socketRef.current || !activeChannel || !content.trim()) return;
    socketRef.current.emit('send_message', {
      channelId: activeChannel._id,
      content,
    });
  };

  const handleTyping = (isTyping) => {
    if (!socketRef.current || !activeChannel) return;
    socketRef.current.emit('typing', {
      channelId: activeChannel._id,
      isTyping,
    });
  };

  const handleChannelDeleted = (channelId) => {
    setChannels((prev) => prev.filter((c) => c._id !== channelId));
    if (activeChannel?._id === channelId) {
      const remaining = channels.filter((c) => c._id !== channelId);
      setActiveChannel(remaining[0] || null);
    }
  };

  return (
    <div className="chat-page">
      <Sidebar
        channels={channels}
        activeChannel={activeChannel}
        user={user}
        onSelectChannel={handleSelectChannel}
        onCreateChannel={handleCreateChannel}
        onChannelDeleted={handleChannelDeleted}
        onLogout={logoutUser}
      />
      <ChatArea
        channel={activeChannel}
        messages={messages}
        loading={loadingMessages}
        typingUsers={typingUsers}
        currentUser={user}
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        onMessageDeleted={(id) =>
          setMessages((prev) => prev.filter((m) => m._id !== id))
        }
      />
    </div>
  );
}
