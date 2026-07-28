import { useEffect, useState, useRef } from 'react';
import { IoChatbubbleEllipsesOutline, IoChevronBack, IoSend, IoTrashOutline, IoExitOutline, IoClose } from 'react-icons/io5';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';
import ChatSidebar from '../Components/ChatSidebar';
import { useEncryption } from '../contexts/EncryptionContext';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/axios';
import './ChatPage.css';

function ChatPage() {
  const { user: currentUser } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [notification, setNotification] = useState(null);
  const messagesEndRef = useRef(null);
  const { initializeConnectionEncryption, encryptForUser, decryptFromUser, getKeyPair } = useEncryption();
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

    const handleReceiveMessage = async (message) => {
      console.log('Received real-time message:', message);
      
      // Decrypt if encrypted
      let body = message.body;
      if (message.is_encrypted && selectedUser) {
        try {
          // Ensure encryption is initialized before decrypting
          if (!encryptionReady) {
            const keyPair = getKeyPair(currentUser?.uid);
            if (keyPair) {
              const partnerPublicKey = selectedUser.isRequester ? selectedUser.receiverPublicKey : selectedUser.requesterPublicKey;
              if (partnerPublicKey) {
                await initializeConnectionEncryption(currentUser?.uid, partnerPublicKey);
                setEncryptionReady(true);
              }
            }
          }
          
          if (encryptionReady) {
            body = await decryptFromUser(currentUser?.uid, message.body);
          } else {
            console.warn('Encryption not ready, showing encrypted message');
            body = '[Encrypted]';
          }
        } catch (error) {
          console.error('Error decrypting real-time message:', error);
          body = '[Encrypted - Unable to decrypt]';
        }
      }

      const formattedMessage = {
        id: message._id,
        text: body,
        sender: message.sender_id === selectedUser?.uid ? 'them' : 'me',
        timestamp: new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, formattedMessage]);

      // If this message is for the currently selected user, auto-refresh the chat
      if (selectedUser?.connectionId === message.connection_id) {
        console.log('Auto-refreshing chat for current user');
        // Re-fetch messages to ensure full sync with database
        await fetchMessages(selectedUser.connectionId);
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
    socket.on('connection:disconnected', handleDisconnect);

    return () => {
      socket.off('message:receive', handleReceiveMessage);
      socket.off('connection:disconnected', handleDisconnect);
    };
  }, [socket, isConnected, selectedUser, decryptFromUser]);

  const fetchAcceptedConnections = async () => {
    try {
      const response = await axios.get('/api/connections/accepted');
      if (response.data.success) {
        const users = response.data.connections.map(conn => {
          const partner = conn.collaborator;
          const isRequester = conn.requester_id === currentUser?.uid;
          return {
            uid: partner?.uid || partner?._id,
            _id: conn._id,
            name: partner?.name || 'Unknown User',
            avatarUrl: partner?.avatarUrl || null,
            profession: partner?.profession || '',
            is_online: partner?.isOnline || false,
            connectionId: conn._id,
            requesterPublicKey: conn.requester_public_key,
            receiverPublicKey: conn.receiver_public_key,
            isRequester: isRequester
          };
        });
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
    setEncryptionReady(false);

    // Join the connection room for real-time messaging
    if (user.connectionId) {
      joinConnection(user.connectionId);
    }

    // Initialize encryption for this user
    try {
      const keyPair = getKeyPair(currentUser?.uid);
      if (keyPair) {
        const partnerPublicKey = user.isRequester ? user.receiverPublicKey : user.requesterPublicKey;
        
        if (partnerPublicKey) {
          console.log('Initializing encryption for current user:', currentUser?.uid, 'with partner:', user.uid);
          await initializeConnectionEncryption(currentUser?.uid, partnerPublicKey);
          setEncryptionReady(true);
          console.log('Encryption initialized successfully');
          await fetchMessages(user.connectionId);
        } else {
          console.error('Partner public key not found in connection');
          setEncryptionReady(true);
          await fetchMessages(user.connectionId);
        }
      } else {
        console.error('No encryption keys found for current user');
        setEncryptionReady(true);
        await fetchMessages(user.connectionId);
      }
    } catch (error) {
      console.error('Error initializing encryption:', error);
      setEncryptionReady(true);
      await fetchMessages(user.connectionId);
    }
  };

  const fetchMessages = async (connectionId) => {
    if (!connectionId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/chat/${connectionId}/messages`);
      if (response.data.success) {
        // Ensure encryption is ready before decrypting
        if (!encryptionReady && selectedUser) {
          const keyPair = getKeyPair(currentUser?.uid);
          if (keyPair) {
            const partnerPublicKey = selectedUser.isRequester ? selectedUser.receiverPublicKey : selectedUser.requesterPublicKey;
            if (partnerPublicKey) {
              await initializeConnectionEncryption(currentUser?.uid, partnerPublicKey);
              setEncryptionReady(true);
            }
          }
        }

        const decryptedMessages = await Promise.all(
          response.data.messages.map(async (msg) => {
            if (msg.is_encrypted && encryptionReady) {
              try {
                const decrypted = await decryptFromUser(currentUser?.uid, msg.body);
                return { ...msg, body: decrypted };
              } catch (error) {
                console.error('Error decrypting message:', error);
                return { ...msg, body: '[Encrypted - Unable to decrypt]' };
              }
            } else if (msg.is_encrypted && !encryptionReady) {
              console.warn('Encryption not ready for message');
              return { ...msg, body: '[Encrypted]' };
            }
            return msg;
          })
        );
        
        const formattedMessages = decryptedMessages.map(msg => ({
          id: msg._id,
          text: msg.body,
          sender: msg.sender_id === selectedUser?.uid ? 'them' : 'me',
          timestamp: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
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

    if (!window.confirm('Are you sure you want to clear this chat? This will delete all messages for both users.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.delete(`/api/chat/${selectedUser.connectionId}/messages`);
      if (response.data.success) {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
      alert('Failed to clear chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!selectedUser?.connectionId) return;

    if (!window.confirm('Are you sure you want to disconnect from this user? This will remove the connection for both users.')) {
      return;
    }

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
      alert('Failed to disconnect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedUser) return;

    try {
      setLoading(true);

      let bodyToSend = newMessage;
      let isEncrypted = false;

      // Try to encrypt the message if we have encryption keys
      if (encryptionReady) {
        try {
          bodyToSend = await encryptForUser(selectedUser.uid, newMessage);
          isEncrypted = true;
        } catch (encryptError) {
          console.error('Encryption failed, sending unencrypted:', encryptError);
          bodyToSend = newMessage;
          isEncrypted = false;
        }
      }

      const response = await axios.post(`/api/chat/${selectedUser.connectionId}/messages`, {
        body: bodyToSend,
        is_encrypted: isEncrypted
      });

      if (response.data.success) {
        const message = {
          id: response.data.message._id,
          text: newMessage,
          sender: 'me',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((currentMessages) => [...currentMessages, message]);
        setNewMessage('');

        // Broadcast the message via Socket.io for real-time delivery
        sendMessage(selectedUser.connectionId, response.data.message);
      } else {
        console.error('Send failed:', response.data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      alert('Failed to send message. Please try again.');
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
      <Header />
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

      <NavigationBar />
    </div>
  );
}

export default ChatPage;
