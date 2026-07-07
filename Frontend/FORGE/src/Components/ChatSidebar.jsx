import React from 'react';
import './ChatSidebar.css';

const ChatSidebar = ({ connectedUsers = [], selectedUser, onSelectUser }) => {
  return (
    <aside className="chat-sidebar" aria-label="Chat sidebar">
      <div className="chat-sidebar__top">
        <div className="chat-sidebar__brand">
          <div className="chat-sidebar__brandIcon" aria-hidden="true">
            💬
          </div>
          <div className="chat-sidebar__brandText">
            <div className="chat-sidebar__brandTitle">Messages</div>
            <div className="chat-sidebar__brandSub">{connectedUsers.length} online</div>
          </div>
        </div>

        <div className="chat-sidebar__searchWrap">
          <div className="chat-sidebar__searchIcon" aria-hidden="true">
            �
          </div>
          <input
            className="chat-sidebar__search"
            type="text"
            placeholder="Search conversations..."
            aria-label="Search conversations"
          />
        </div>
      </div>

      <div className="chat-sidebar__list" aria-label="Connected users">
        {connectedUsers.length === 0 ? (
          <div className="chat-sidebar__empty">
            <div className="chat-sidebar__emptyIcon">👥</div>
            <div className="chat-sidebar__emptyText">No conversations yet</div>
            <div className="chat-sidebar__emptySub">Start connecting with people</div>
          </div>
        ) : (
          connectedUsers.map((user) => (
            <div
              key={user.id}
              className={`chat-sidebar__thread ${selectedUser?.id === user.id ? 'chat-sidebar__thread--active' : ''}`}
              onClick={() => onSelectUser(user)}
            >
              <div className="chat-sidebar__avatarWrapper">
                <div className="chat-sidebar__avatar" aria-hidden="true">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                {user.status === 'Online' && (
                  <div className="chat-sidebar__statusIndicator" />
                )}
              </div>

              <div className="chat-sidebar__threadMain">
                <div className="chat-sidebar__threadRow">
                  <div className="chat-sidebar__threadName">{user.name}</div>
                  <div className="chat-sidebar__threadTime">
                    {user.lastSeen}
                  </div>
                </div>
                <div className="chat-sidebar__threadPreview">
                  {user.status === 'Online' ? 'Active now' : `Last seen ${user.lastSeen}`}
                </div>
              </div>

              {user.unread > 0 && (
                <div className="chat-sidebar__threadAside">
                  <div className="chat-sidebar__unread" aria-hidden="true">
                    {user.unread}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="chat-sidebar__footer" aria-label="Sidebar footer">
        <div className="chat-sidebar__tips">
          <div className="chat-sidebar__tipsIcon" aria-hidden="true">
            ✨
          </div>
          <div className="chat-sidebar__tipsText">Select a conversation to start chatting</div>
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;


