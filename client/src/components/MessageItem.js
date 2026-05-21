import React, { useState } from 'react';
import { deleteMessage } from '../services/api';

function formatTime(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
}

function getInitials(name) {
  return name ? name.slice(0, 2).toUpperCase() : '??';
}

function getAvatarColor(name) {
  const colors = [
    '#5865F2', '#57F287', '#FEE75C', '#EB459E',
    '#ED4245', '#3BA55D', '#FAA61A', '#9B59B6',
  ];
  let hash = 0;
  for (let i = 0; i < (name?.length || 0); i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function MessageItem({ message, isGrouped, isOwn, onDelete }) {
  const [showActions, setShowActions] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this message?')) return;
    setDeleting(true);
    try {
      await deleteMessage(message._id);
      onDelete(message._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete message');
      setDeleting(false);
    }
  };

  return (
    <div
      className={`message-item ${isGrouped ? 'grouped' : ''} ${deleting ? 'deleting' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isGrouped ? (
        <div
          className="message-avatar"
          style={{ backgroundColor: getAvatarColor(message.authorName) }}
        >
          {getInitials(message.authorName)}
        </div>
      ) : (
        <div className="message-avatar-placeholder">
          {showActions && (
            <span className="message-time-small">{formatTime(message.createdAt)}</span>
          )}
        </div>
      )}

      <div className="message-content">
        {!isGrouped && (
          <div className="message-header">
            <span className="message-author">{message.authorName}</span>
            <span className="message-timestamp">
              {formatDate(message.createdAt)} at {formatTime(message.createdAt)}
            </span>
          </div>
        )}
        <p className="message-text">{message.content}</p>
      </div>

      {/* Actions (delete, shown on hover for own messages) */}
      {isOwn && showActions && (
        <div className="message-actions">
          <button
            className="action-btn delete-btn"
            onClick={handleDelete}
            title="Delete message"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
