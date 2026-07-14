import { useEffect, useState } from 'react';
import { IoChatbubbleEllipsesOutline, IoChevronBack, IoSend } from 'react-icons/io5';
import NavigationBar from '../Components/NavigationBar';
import Header from '../Components/Header';
import ChatSidebar from '../Components/ChatSidebar';
import './ChatPage.css';

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

  const connectedUsers = [];

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (isMobile) {
      setShowChat(true);
    }
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
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((currentMessages) => [...currentMessages, message]);
      setNewMessage('');
    }
  };

  const renderMessages = () => (
    <div className="chat-window__messages">
      {messages.length === 0 ? (
        <div className="chat-window__empty">
          <IoChatbubbleEllipsesOutline />
          <h3>Start a conversation with {selectedUser.name}</h3>
          <p>Messages you send will appear here.</p>
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${message.sender === 'me' ? 'chat-message--me' : 'chat-message--them'}`}
          >
            <div className="chat-message__bubble">
              <div>{message.text}</div>
              <span>{message.timestamp}</span>
            </div>
          </div>
        ))
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
      />
      <button type="submit" aria-label="Send message">
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
              {selectedUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="chat-window__person">
              <h2>{selectedUser.name}</h2>
              <p>{selectedUser.status}</p>
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
