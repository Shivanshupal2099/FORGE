import { useState, useEffect } from 'react';
import NavigationBar from '../Components/NavigationBar';
import ChatSidebar from '../Components/ChatSidebar';

function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mock connected users - replace with actual data from backend
  const connectedUsers = [
    { id: 1, name: 'John Doe', status: 'Online', lastSeen: 'Now', unread: 2 },
    { id: 2, name: 'Jane Smith', status: 'Online', lastSeen: '2m ago', unread: 0 },
    { id: 3, name: 'Mike Johnson', status: 'Away', lastSeen: '1h ago', unread: 5 },
  ];

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (isMobile) {
      setShowChat(true);
    }
    // Load messages for selected user - replace with actual API call
    setMessages([]);
  };

  const handleBackToSidebar = () => {
    setShowChat(false);
    setSelectedUser(null);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUser) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <div
      className="page-shell"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
        background: '#000000',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: 16,
          alignItems: 'stretch',
          justifyContent: 'center',
          marginTop: 0,
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Desktop: Show both sidebar and chat */}
        {!isMobile && (
          <>
            <ChatSidebar
              connectedUsers={connectedUsers}
              selectedUser={selectedUser}
              onSelectUser={handleSelectUser}
            />

            <div
              style={{
                flex: 1,
                borderRadius: 28,
                border: '2px solid #000000',
                background: '#FFD700',
                boxShadow: '0 28px 80px rgba(255, 215, 0, 0.3)',
                padding: 28,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {selectedUser ? (
                <>
                  <div
                    style={{
                      borderBottom: '2px solid #000000',
                      paddingBottom: 16,
                      marginBottom: 16,
                    }}
                  >
                    <h2 style={{ color: '#000000', margin: 0, fontSize: '1.5rem' }}>
                      {selectedUser.name}
                    </h2>
                    <p style={{ color: '#000000', opacity: 0.7, margin: '4px 0 0 0' }}>
                      {selectedUser.status}
                    </p>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      overflowY: 'auto',
                      marginBottom: 16,
                      background: '#FFFFFF',
                      borderRadius: 16,
                      padding: 16,
                      border: '2px solid #000000',
                    }}
                  >
                    {messages.length === 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          color: '#000000',
                          opacity: 0.5,
                        }}
                      >
                        Start a conversation with {selectedUser.name}
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          style={{
                            marginBottom: 12,
                            display: 'flex',
                            justifyContent:
                              message.sender === 'me' ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '70%',
                              padding: '12px 16px',
                              borderRadius: 16,
                              background:
                                message.sender === 'me' ? '#000000' : '#e0e0e0',
                              color: message.sender === 'me' ? '#FFD700' : '#000000',
                            }}
                          >
                            <div>{message.text}</div>
                            <div
                              style={{
                                fontSize: '0.75rem',
                                opacity: 0.7,
                                marginTop: 4,
                              }}
                            >
                              {message.timestamp}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 12 }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      style={{
                        flex: 1,
                        padding: '14px 16px',
                        border: '2px solid #000000',
                        borderRadius: 16,
                        background: '#FFFFFF',
                        color: '#000000',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '14px 24px',
                        border: '2px solid #000000',
                        borderRadius: 16,
                        background: '#000000',
                        color: '#FFD700',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#000000',
                  }}
                >
                  <h1 style={{ marginBottom: 12, fontSize: '2rem' }}>Chat</h1>
                  <p style={{ opacity: 0.7, lineHeight: 1.6, textAlign: 'center' }}>
                    Select a user from the sidebar to start chatting
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Mobile: Show sidebar or chat based on state */}
        {isMobile && (
          <>
            {!showChat ? (
              <ChatSidebar
                connectedUsers={connectedUsers}
                selectedUser={selectedUser}
                onSelectUser={handleSelectUser}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  borderRadius: 28,
                  border: '2px solid #000000',
                  background: '#FFD700',
                  boxShadow: '0 28px 80px rgba(255, 215, 0, 0.3)',
                  padding: 20,
                  paddingBottom: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 'calc(100vh - 40px)',
                }}
              >
                <div
                  style={{
                    borderBottom: '2px solid #000000',
                    paddingBottom: 12,
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <button
                    onClick={handleBackToSidebar}
                    style={{
                      padding: '8px 12px',
                      border: '2px solid #000000',
                      borderRadius: '12px',
                      background: '#000000',
                      color: '#FFD700',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '1rem',
                    }}
                  >
                    ←
                  </button>
                  <div>
                    <h2 style={{ color: '#000000', margin: 0, fontSize: '1.2rem' }}>
                      {selectedUser.name}
                    </h2>
                    <p style={{ color: '#000000', opacity: 0.7, margin: '2px 0 0 0', fontSize: '0.85rem' }}>
                      {selectedUser.status}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    marginBottom: 12,
                    background: '#FFFFFF',
                    borderRadius: 16,
                    padding: 12,
                    border: '2px solid #000000',
                  }}
                >
                  {messages.length === 0 ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        color: '#000000',
                        opacity: 0.5,
                      }}
                    >
                      Start a conversation with {selectedUser.name}
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        style={{
                          marginBottom: 12,
                          display: 'flex',
                          justifyContent:
                            message.sender === 'me' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '80%',
                            padding: '10px 14px',
                            borderRadius: 16,
                            background:
                              message.sender === 'me' ? '#000000' : '#e0e0e0',
                            color: message.sender === 'me' ? '#FFD700' : '#000000',
                          }}
                        >
                          <div>{message.text}</div>
                          <div
                            style={{
                              fontSize: '0.7rem',
                              opacity: 0.7,
                              marginTop: 4,
                            }}
                          >
                            {message.timestamp}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 10 }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      border: '2px solid #000000',
                      borderRadius: 14,
                      background: '#FFFFFF',
                      color: '#000000',
                      fontSize: '0.9rem',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '12px 20px',
                      border: '2px solid #000000',
                      borderRadius: 14,
                      background: '#000000',
                      color: '#FFD700',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>

      <NavigationBar />
    </div>
  );
}

export default ChatPage;

