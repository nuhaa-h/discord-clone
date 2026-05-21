import React, { useState } from 'react';
import { deleteChannel } from '../services/api';

export default function Sidebar({
  channels,
  activeChannel,
  user,
  onSelectChannel,
  onCreateChannel,
  onChannelDeleted,
  onLogout,
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    setCreating(true);
    setCreateError('');
    const err = await onCreateChannel(newChannelName.trim(), newChannelDesc.trim());
    if (err) {
      setCreateError(err);
    } else {
      setShowCreateModal(false);
      setNewChannelName('');
      setNewChannelDesc('');
    }
    setCreating(false);
  };

  const handleDelete = async (e, channel) => {
    e.stopPropagation();
    if (!window.confirm(`Delete #${channel.name}? This cannot be undone.`)) return;
    try {
      await deleteChannel(channel._id);
      onChannelDeleted(channel._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete channel');
    }
  };

  // Get user initials for avatar
  const getInitials = (username) => {
    return username ? username.slice(0, 2).toUpperCase() : '??';
  };

  return (
    <div className="sidebar">
      {/* Server header */}
      <div className="sidebar-header">
        <div className="server-name">
          <svg width="18" height="18" viewBox="0 0 127.14 96.36" fill="currentColor">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22h0C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
          </svg>
          <span>Discord Clone</span>
        </div>
      </div>

      {/* Channels section */}
      <div className="sidebar-section">
        <div className="section-header">
          <span>TEXT CHANNELS</span>
          <button
            className="add-channel-btn"
            onClick={() => setShowCreateModal(true)}
            title="Create channel"
          >
            +
          </button>
        </div>

        <ul className="channel-list">
          {channels.length === 0 && (
            <li className="no-channels">No channels yet. Create one!</li>
          )}
          {channels.map((channel) => (
            <li
              key={channel._id}
              className={`channel-item ${activeChannel?._id === channel._id ? 'active' : ''}`}
              onClick={() => onSelectChannel(channel)}
            >
              <span className="channel-hash">#</span>
              <span className="channel-name">{channel.name}</span>
              {channel.createdBy === user?.id && (
                <button
                  className="delete-channel-btn"
                  onClick={(e) => handleDelete(e, channel)}
                  title="Delete channel"
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* User panel at bottom */}
      <div className="user-panel">
        <div className="user-avatar">{getInitials(user?.username)}</div>
        <div className="user-info">
          <div className="user-name">{user?.username}</div>
          <div className="user-status">Online</div>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Log out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      {/* Create channel modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Create Channel</h2>
            <p className="modal-subtitle">
              Channels are where your community hangs out. Keep it tidy and fun!
            </p>

            {createError && <div className="modal-error">{createError}</div>}

            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>CHANNEL NAME</label>
                <div className="channel-input-wrapper">
                  <span className="input-prefix">#</span>
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => {
                      setNewChannelName(e.target.value);
                      setCreateError('');
                    }}
                    placeholder="new-channel"
                    required
                    maxLength={50}
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group">
                <label>DESCRIPTION (optional)</label>
                <input
                  type="text"
                  value={newChannelDesc}
                  onChange={(e) => setNewChannelDesc(e.target.value)}
                  placeholder="What's this channel about?"
                  maxLength={200}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
