import React, { useEffect, useRef, useState } from 'react';
import MessageItem from './MessageItem';

export default function ChatArea({
  channel,
  messages,
  loading,
  typingUsers,
  currentUser,
  onSendMessage,
  onTyping,
  onMessageDeleted,
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);

    // Typing indicator
    onTyping(true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
    onTyping(false);
    clearTimeout(typingTimeoutRef.current);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (!channel) {
    return (
      <div className="chat-area empty-state">
        <div className="empty-icon">
          <svg width="72" height="72" viewBox="0 0 127.14 96.36" fill="var(--text-muted)">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
          </svg>
        </div>
        <h2>Welcome to Discord Clone!</h2>
        <p>Select a channel from the sidebar or create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="chat-area">
      {/* Channel header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <span className="chat-hash">#</span>
          <h2 className="chat-channel-name">{channel.name}</h2>
          {channel.description && (
            <>
              <div className="header-divider" />
              <span className="chat-channel-desc">{channel.description}</span>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {loading ? (
          <div className="messages-loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="channel-welcome">
            <div className="welcome-icon">#</div>
            <h3>Welcome to #{channel.name}!</h3>
            <p>This is the beginning of the #{channel.name} channel. Say something nice!</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              const prevMsg = messages[idx - 1];
              const isGrouped =
                prevMsg &&
                prevMsg.authorName === msg.authorName &&
                new Date(msg.createdAt) - new Date(prevMsg.createdAt) < 5 * 60 * 1000;

              return (
                <MessageItem
                  key={msg._id}
                  message={msg}
                  isGrouped={isGrouped}
                  isOwn={msg.author?._id === currentUser?.id || msg.authorName === currentUser?.username}
                  onDelete={onMessageDeleted}
                />
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          <span className="typing-dots">
            <span /><span /><span />
          </span>
          <span className="typing-text">
            {typingUsers.length === 1
              ? `${typingUsers[0]} is typing...`
              : `${typingUsers.join(', ')} are typing...`}
          </span>
        </div>
      )}

      {/* Message input */}
      <form className="message-form" onSubmit={handleSend}>
        <div className="message-input-wrapper">
          <textarea
            ref={textareaRef}
            className="message-input"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${channel.name}`}
            rows={1}
            maxLength={2000}
          />
          <button
            type="submit"
            className="send-btn"
            disabled={!input.trim()}
            title="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
        <div className="input-hint">Press Enter to send · Shift+Enter for new line</div>
      </form>
    </div>
  );
}
