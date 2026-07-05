import NavigationBar from '../Components/NavigationBar';

function ChatPage() {
  return (
    <div
      className="page-shell"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px',
      }}
    >
      <div style={{ flex: 1, textAlign: 'center', marginTop: '40px' }}>
        <h1 style={{ color: '#7d6335', marginBottom: '20px' }}>Chat</h1>
        <p style={{ color: '#7d6335', opacity: 0.7 }}>Chat functionality coming soon...</p>
      </div>
      <NavigationBar />
    </div>
  );
}

export default ChatPage;
