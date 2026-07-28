import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import ViewEvent from '../Components/ViewEvent';

function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/events/${id}`);
        
        if (response.data.success) {
          setEvent(response.data.event);
        } else {
          setError(response.data.message || 'Failed to load event');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(err.response?.data?.message || 'Event not found');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleClose = () => {
    navigate('/home');
  };

  const handleEventUpdated = () => {
    // Refresh event data
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`/api/events/${id}`);
        if (response.data.success) {
          setEvent(response.data.event);
        }
      } catch (err) {
        console.error('Error refreshing event:', err);
      }
    };
    fetchEvent();
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #3182ce',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#ef4444',
          marginBottom: '16px'
        }}>
          {error || 'Event not found'}
        </h2>
        <button
          onClick={() => navigate('/home')}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#ffffff',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <ViewEvent
        event={event}
        onClose={handleClose}
        onEventUpdated={handleEventUpdated}
      />
    </div>
  );
}

export default EventDetailPage;
