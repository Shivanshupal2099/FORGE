import { useEffect, useState, useRef } from 'react';
import { IoChatbubbleEllipsesOutline, IoChevronBack, IoSend, IoTrashOutline, IoExitOutline, IoClose, IoAdd } from 'react-icons/io5';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';
import ChatSidebar from '../Components/ChatSidebar';
import CommunityJoinPopup from '../Components/CommunityJoinPopup';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { useAlert } from '../contexts/AlertContext';
import axios from '../api/axios';
import './ChatPage.css';

function ChatPage() {
  const { user: currentUser } = useAuth();
  const { error: showError, success: showSuccess } = useAlert();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [notification, setNotification] = useState(null);
  const [pendingMessageIds, setPendingMessageIds] = useState(new Set());
  const [showCommunityPopup, setShowCommunityPopup] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmPopupData, setConfirmPopupData] = useState(null);
  const messagesEndRef = useRef(null);
  const { socket, isConnected, joinConnection, leaveConnection, sendMessage } = useSocket();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch accepted connections on component mount
  useEffect(() => {
    fetchAcceptedConnections();
  }, []);

  // Check for pre-selected user from Usercard navigation
  useEffect(() => {
    const selectedChatUser = localStorage.getItem('selectedChatUser');
    if (selectedChatUser) {
      try {
        const userData = JSON.parse(selectedChatUser);
        const foundUser = connectedUsers.find(u => u.uid === userData.uid);
        if (foundUser) {
          handleSelectUser(foundUser);
        } else {
          const checkInterval = setInterval(() => {
            const user = connectedUsers.find(u => u.uid === userData.uid);
            if (user) {
              handleSelectUser(user);
              clearInterval(checkInterval);
            }
          }, 500);
          setTimeout(() => clearInterval(checkInterval), 5000);
        }
        localStorage.removeItem('selectedChatUser');
      } catch (error) {
        console.error('Error parsing selected chat user:', error);
      }
    }
  }, [connectedUsers]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleReceiveMessage = (message) => {
      console.log('Received real-time message:', message);
      
      if (!message || !message._id) {
        console.log('Invalid message received');
        return;
      }

      // Skip if this message ID is in the pending set (avoid duplication)
      if (pendingMessageIds.has(message._id.toString())) {
        console.log('Skipping duplicate message from Socket.io:', message._id);
        return;
      }

      const currentUserId = currentUser?.uid || currentUser?.email;
      const senderId = typeof message.sender_id === 'string' ? message.sender_id : message.sender_id?.toString();

      const formattedMessage = {
        id: message._id,
        text: message.body,
        sender: senderId === currentUserId ? 'me' : 'them',
        timestamp: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      console.log('Formatted message:', formattedMessage);

      // Only add message if it's not already in the array (prevent duplicates)
      setMessages(prev => {
        if (prev.some(msg => msg.id === formattedMessage.id)) {
          return prev;
        }
        return [...prev, formattedMessage];
      });
    };

    const handleMessagesDeleted = (data) => {
      console.log('Received messages deleted event:', data);
      const deletedIds = data.deletedIds || [];
      if (deletedIds.length > 0) {
        setMessages(prev => prev.filter(msg => !deletedIds.includes(msg.id)));
      }
    };

    const handleDisconnect = (data) => {
      console.log('Connection disconnected:', data);
      // Remove user from connected users
      setConnectedUsers(prev => prev.filter(user => user.connectionId !== data.connectionId));
      // If the disconnected user was selected, clear the chat
      if (selectedUser?.connectionId === data.connectionId) {
        setSelectedUser(null);
        setMessages([]);
      }
      // Show popup notification
      setNotification({
        type: 'disconnect',
        message: 'You have been disconnected from this user.'
      });
      // Auto-hide notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    };

    socket.on('message:receive', handleReceiveMessage);
    socket.on('messages:deleted', handleMessagesDeleted);
    socket.on('connection:disconnected', handleDisconnect);

    return () => {
      socket.off('message:receive', handleReceiveMessage);
      socket.off('messages:deleted', handleMessagesDeleted);
      socket.off('connection:disconnected', handleDisconnect);
    };
  }, [socket, isConnected, selectedUser, currentUser, pendingMessageIds]);

  const fetchAcceptedConnections = async () => {
    try {
      const response = await axios.get('/api/connections/accepted');
      if (response.data.success) {
        const users = response.data.connections.map(conn => {
          const partner = conn.collaborator;
          console.log('Partner data:', partner);
          
          // Always use MongoDB _id as the primary identifier
          const mongoDbId = partner?.id || partner?._id;
          const username = partner?.uid;
          
          console.log('Mapping user - MongoDB _id:', mongoDbId, 'Username:', username);
          
          return {
            uid: username, // Keep username for reference
            _id: mongoDbId, // MongoDB _id for API calls
            name: partner?.name || 'Unknown User',
            avatarUrl: partner?.avatarUrl || null,
            profession: partner?.profession || '',
            is_online: partner?.isOnline || false,
            connectionId: conn._id,
            isRequester: conn.requester_id === mongoDbId
          };
        });
        console.log('Connected users mapped:', users);
        setConnectedUsers(users);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    if (isMobile) {
      setShowChat(true);
    }
    setMessages([]);

    // Join the connection room for real-time messaging
    if (user.connectionId) {
      joinConnection(user.connectionId);
    }

    await fetchMessages(user.connectionId);
  };

  const fetchMessages = async (connectionId) => {
    if (!connectionId) return;
    
    try {
      setLoading(true);
      console.log('Fetching messages for connection:', connectionId);
      const response = await axios.get(`/api/chat/${connectionId}/messages`);
      console.log('Messages response:', response.data);
      
      if (response.data.success) {
        const formattedMessages = response.data.messages.map(msg => {
          // Handle both ObjectId and string for sender_id comparison
          const senderId = typeof msg.sender_id === 'string' ? msg.sender_id : msg.sender_id?.toString();
          const currentUserId = currentUser?.uid || currentUser?.email;
          
          // If sender is current user, it's 'me', otherwise 'them'
          return {
            id: msg._id,
            text: msg.body,
            sender: senderId === currentUserId ? 'me' : 'them',
            timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        });
        
        console.log('Formatted messages:', formattedMessages);
        setMessages(formattedMessages);
      } else {
        console.error('Failed to fetch messages:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching messages:', error.response?.data || error.message);
      console.error('Full error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToSidebar = () => {
    if (selectedUser?.connectionId) {
      leaveConnection(selectedUser.connectionId);
    }
    setShowChat(false);
    setSelectedUser(null);
  };

  const handleClearChat = async () => {
    if (!selectedUser?.connectionId) return;

    setConfirmPopupData({
      title: 'Clear Chat',
      message: 'Are you sure you want to clear this chat? This will delete all messages for both users.',
      onConfirm: async () => {
        setShowConfirmPopup(false);
        try {
          setLoading(true);
          const response = await axios.delete(`/api/chat/${selectedUser.connectionId}/messages`);
          if (response.data.success) {
            setMessages([]);
          }
        } catch (error) {
          console.error('Error clearing chat:', error);
          showError('Failed to clear chat. Please try again.');
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {
        setShowConfirmPopup(false);
      }
    });
    setShowConfirmPopup(true);
  };

  const handleJoinCommunity = async (communityData) => {
    // Placeholder for future implementation
    console.log('Community join request:', communityData);
    // No backend call for now - coming soon
  };

  const handleDisconnect = async () => {
    if (!selectedUser?.connectionId) return;

    setConfirmPopupData({
      title: 'Disconnect User',
      message: 'Are you sure you want to disconnect from this user? This will remove the connection for both users.',
      onConfirm: async () => {
        setShowConfirmPopup(false);
        try {
          setLoading(true);
          const response = await axios.delete(`/api/connections/${selectedUser.connectionId}`);
          if (response.data.success) {
            // Remove user from connected users
            setConnectedUsers(prev => prev.filter(user => user.connectionId !== selectedUser.connectionId));
            // Clear selected user and messages
            setSelectedUser(null);
            setMessages([]);
            // Leave the socket room
            leaveConnection(selectedUser.connectionId);
          }
        } catch (error) {
          console.error('Error disconnecting:', error);
          showError('Failed to disconnect. Please try again.');
        } finally {
          setLoading(false);
        }
      },
      onCancel: () => {
        setShowConfirmPopup(false);
      }
    });
    setShowConfirmPopup(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedUser) return;

    try {
      setLoading(true);

      console.log('Sending message - selectedUser:', selectedUser);
      console.log('Sending message - connectionId:', selectedUser.connectionId);
      console.log('Sending message - user MongoDB _id:', selectedUser._id);

      const response = await axios.post(`/api/chat/${selectedUser.connectionId}/messages`, {
        body: newMessage
      });

      console.log('Send response:', response.data);

      if (response.data.success) {
        // Add message ID to pending set BEFORE adding to messages to prevent race condition
        const tempMessageId = response.data.message._id;
        setPendingMessageIds(prev => new Set([...prev, tempMessageId]));

        // Add message locally for sender immediately
        const message = {
          id: tempMessageId,
          text: newMessage,
          sender: 'me',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((currentMessages) => {
          // Double-check that message doesn't already exist before adding
          if (currentMessages.some(msg => msg.id === tempMessageId)) {
            return currentMessages;
          }
          return [...currentMessages, message];
        });
        setNewMessage('');

        // Remove from pending set after 2 seconds
        setTimeout(() => {
          setPendingMessageIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(tempMessageId);
            return newSet;
          });
        }, 2000);
      } else {
        console.error('Send failed:', response.data.message);
        showError(`Failed to send message: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      console.error('Full error:', error);
      showError(`Failed to send message. ${error.response?.data?.message || error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const renderMessages = () => (
    <div className={`chat-window__messages ${messages.length > 4 ? 'chat-window__messages--scrollable' : ''}`}>
      {messages.length === 0 ? (
        <div className="chat-window__empty">
          <IoChatbubbleEllipsesOutline />
          <h3>Start a conversation with {selectedUser?.name || 'this user'}</h3>
          <p>Messages you send will appear here.</p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <div
              key={message?.id || Math.random()}
              className={`chat-message ${message?.sender === 'me' ? 'chat-message--me' : 'chat-message--them'}`}
            >
              <div className="chat-message__bubble">
                <div>{message?.text || ''}</div>
                <span>{message?.timestamp || ''}</span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );

  const renderComposer = () => (
    <form onSubmit={handleSendMessage} className="chat-composer">
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={loading}
      />
      <button type="submit" aria-label="Send message" disabled={loading}>
        <IoSend />
        <span>Send</span>
      </button>
      {isMobile && (
        <button
          type="button"
          className="chat-composer__join-community"
          onClick={() => setShowCommunityPopup(true)}
          aria-label="Join community"
          disabled={loading}
        >
          <IoAdd />
        </button>
      )}
    </form>
  );

  const renderChatWindow = ({ mobile = false } = {}) => (
    <section className={`chat-window ${mobile ? 'chat-window--mobile' : ''}`}>
      {selectedUser ? (
        <>
          <header className="chat-window__header">
            {mobile && (
              <button type="button" className="chat-window__back" onClick={handleBackToSidebar} aria-label="Back to conversations">
                <IoChevronBack />
              </button>
            )}
            <div className="chat-window__avatar" aria-hidden="true">
              {selectedUser.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="chat-window__person">
              <h2>{selectedUser.name || 'Unknown User'}</h2>
              <p>{selectedUser.is_online ? 'Online' : selectedUser.profession || ''}</p>
            </div>
            <div className="chat-window__actions">
              <button 
                type="button" 
                className="chat-window__close" 
                onClick={handleBackToSidebar}
                aria-label="Close chat"
              >
                <IoChevronBack />
              </button>
              <button 
                type="button" 
                className="chat-window__clear" 
                onClick={handleClearChat}
                aria-label="Clear chat"
                disabled={loading}
              >
                <IoTrashOutline />
              </button>
              <button 
                type="button" 
                className="chat-window__disconnect" 
                onClick={handleDisconnect}
                aria-label="Disconnect"
                disabled={loading}
              >
                <IoExitOutline />
              </button>
            </div>
          </header>

          {renderMessages()}
          {renderComposer()}
        </>
      ) : (
        <div className="chat-window__placeholder">
          <IoChatbubbleEllipsesOutline />
          <h1>Chat</h1>
          <p>Select a conversation from the sidebar to start messaging.</p>
        </div>
      )}
    </section>
  );

  return (
    <div className="page-shell chat-page">
      {notification && (
        <div className={`chat-notification chat-notification--${notification.type}`}>
          <div className="chat-notification__content">
            <span>{notification.message}</span>
            <button 
              className="chat-notification__close" 
              onClick={() => setNotification(null)}
              aria-label="Close notification"
            >
              <IoClose />
            </button>
          </div>
        </div>
      )}
      <Header
        hideLogo={true}
        showJoinCommunityOnMobile={true}
        onJoinCommunity={() => setShowCommunityPopup(true)}
      />
      <div className="chat-layout">
        {!isMobile && (
          <>
            <ChatSidebar
              connectedUsers={connectedUsers}
              selectedUser={selectedUser}
              onSelectUser={handleSelectUser}
            />
            {renderChatWindow()}
          </>
        )}

        {isMobile && (
          <>
            {!showChat ? (
              <ChatSidebar
                connectedUsers={connectedUsers}
                selectedUser={selectedUser}
                onSelectUser={handleSelectUser}
              />
            ) : (
              renderChatWindow({ mobile: true })
            )}
          </>
        )}
      </div>

      <NavigationBar 
        onJoinCommunity={() => setShowCommunityPopup(true)}
        isChatPage={true}
      />

      {showCommunityPopup && (
        <CommunityJoinPopup
          onClose={() => setShowCommunityPopup(false)}
          onJoin={handleJoinCommunity}
        />
      )}

      {showConfirmPopup && confirmPopupData && (
        <div className="chat-confirm-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
        }}>
          <div className="chat-confirm-popup" style={{
            background: 'var(--app-card-bg)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--app-card-border)',
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              color: 'var(--app-text)',
              fontSize: '1.2rem',
              fontWeight: '800',
            }}>
              {confirmPopupData.title}
            </h3>
            <p style={{
              margin: '0 0 20px 0',
              color: 'var(--app-muted-text)',
              fontSize: '0.95rem',
              lineHeight: '1.5',
            }}>
              {confirmPopupData.message}
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={confirmPopupData.onCancel}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '2px solid var(--app-card-border)',
                  background: 'var(--app-surface)',
                  color: 'var(--app-text)',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--app-surface-strong)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--app-surface)';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmPopupData.onConfirm}
                style={{
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '2px solid transparent',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#991b1b',
                  fontSize: '0.95rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(239, 68, 68, 0.15)';
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
