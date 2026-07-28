import { IoChatbubblesOutline, IoPeopleOutline, IoSparklesOutline } from 'react-icons/io5';
import { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import './ChatSidebar.css';

const ChatSidebar = ({ connectedUsers = [], selectedUser, onSelectUser }) => {
  const { socket, isConnected } = useSocket();
  const [usersWithMessages, setUsersWithMessages] = useState(connectedUsers);

  // Update users when connectedUsers prop changes
  useEffect(() => {
    setUsersWithMessages(connectedUsers);
  }, [connectedUsers]);

  // Listen for new messages to update sidebar
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewMessage = (data) => {
      const { message } = data;
      // Update the user's last message in the sidebar
      setUsersWithMessages(prev => prev.map(user => {
        if (user.connectionId === message.connection_id) {
          return {
            ...user,
            lastMessage: message.body,
            lastMessageTime: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: user.uid !== message.sender_id
          };
        }
        return user;
      }));
    };

    socket.on('message:receive', handleNewMessage);

    return () => {
      socket.off('message:receive', handleNewMessage);
    };
  }, [socket, isConnected]);

  return (
    <aside className="chat-sidebar" aria-label="Chat sidebar">
      <div className="chat-sidebar__top">
        <div className="chat-sidebar__brand">
          <div className="chat-sidebar__brandIcon" aria-hidden="true">
            <IoChatbubblesOutline />
          </div>
          <div className="chat-sidebar__brandText">
            <div className="chat-sidebar__brandTitle">Messages</div>
            <div className="chat-sidebar__brandSub">{usersWithMessages.length} conversations</div>
          </div>
        </div>
      </div>

      <div className="chat-sidebar__list" aria-label="Connected users">
        {usersWithMessages.length === 0 ? (
          <div className="chat-sidebar__empty">
            <div className="chat-sidebar__emptyIcon">
              <IoPeopleOutline />
            </div>
            <div className="chat-sidebar__emptyText">No conversations yet</div>
            <div className="chat-sidebar__emptySub">Start connecting with people</div>
          </div>
        ) : (
          usersWithMessages.map((user) => (
            <button
              type="button"
              key={user?.uid || user?._id || Math.random()}
              className={`chat-sidebar__thread ${selectedUser?.uid === user?.uid ? 'chat-sidebar__thread--active' : ''}`}
              onClick={() => onSelectUser(user)}
            >
              <div className="chat-sidebar__avatarWrapper">
                <div className="chat-sidebar__avatar" aria-hidden="true">
                  {user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                {user?.is_online && (
                  <div className="chat-sidebar__statusIndicator" />
                )}
                {user?.unread && (
                  <div className="chat-sidebar__unreadBadge" />
                )}
              </div>

              <div className="chat-sidebar__threadMain">
                <div className="chat-sidebar__threadRow">
                  <div className="chat-sidebar__threadName">{user?.name || 'Unknown'}</div>
                  <div className="chat-sidebar__threadTime">
                    {user?.lastMessageTime || (user?.is_online ? 'Active now' : '')}
                  </div>
                </div>
                <div className="chat-sidebar__threadPreview">
                  {user?.lastMessage || (user?.is_online ? 'Active now' : 'Click to start chatting')}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      <div className="chat-sidebar__footer" aria-label="Sidebar footer">
        <div className="chat-sidebar__tips">
          <div className="chat-sidebar__tipsIcon" aria-hidden="true">
            <IoSparklesOutline />
          </div>
          <div className="chat-sidebar__tipsText">Select a conversation to start chatting</div>
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;
