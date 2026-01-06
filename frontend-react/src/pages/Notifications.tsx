import { useEffect, useState } from 'react';
import { useAuth0 } from '../auth/useAuth0';

interface Notification {
  id: string;
  userId: string;
  type: 'device.collected' | 'device.returned' | 'device.available' | 'device.reserved' | 'device.cancelled';
  title: string;
  message: string;
  loanId?: string;
  deviceId?: string;
  deviceBrand?: string;
  deviceModel?: string;
  createdAt: string;
  read: boolean;
}

const API_BASE = {
  loanService: import.meta.env.VITE_LOAN_SERVICE_API || 'http://localhost:7072/api'
};

export default function Notifications() {
  const { user, getAccessToken } = useAuth0();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = await getAccessToken();
      const response = await fetch(`${API_BASE.loanService}/notifications?userId=${user?.email}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setError('');
      } else {
        setError('Failed to load notifications');
      }
    } catch (err) {
      setError('Error loading notifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = await getAccessToken();
      await fetch(`${API_BASE.loanService}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'device.collected': return '📦';
      case 'device.returned': return '✅';
      case 'device.available': return '🎉';
      case 'device.reserved': return '🔒';
      case 'device.cancelled': return '❌';
      default: return '📬';
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'device.collected': return '#3b82f6'; // blue
      case 'device.returned': return '#10b981'; // green
      case 'device.available': return '#f59e0b'; // amber
      case 'device.reserved': return '#8b5cf6'; // purple
      case 'device.cancelled': return '#ef4444'; // red
      default: return '#6b7280'; // gray
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading notifications...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>📬 My Notifications</h2>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {notifications.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>No notifications yet</div>
          <div style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
            You'll receive notifications when you collect, return, or devices become available
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => !notification.read && markAsRead(notification.id)}
              style={{
                padding: '16px',
                backgroundColor: notification.read ? '#ffffff' : '#eff6ff',
                border: `2px solid ${notification.read ? '#e5e7eb' : '#bfdbfe'}`,
                borderRadius: '12px',
                cursor: notification.read ? 'default' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: notification.read ? '0 1px 2px rgba(0,0,0,0.05)' : '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                <div style={{ fontSize: '32px', marginTop: '4px' }}>
                  {getIcon(notification.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: getTypeColor(notification.type) }}>
                      {notification.title}
                      {!notification.read && (
                        <span style={{ 
                          marginLeft: '8px', 
                          padding: '2px 8px', 
                          fontSize: '12px', 
                          backgroundColor: '#3b82f6', 
                          color: 'white', 
                          borderRadius: '12px' 
                        }}>
                          New
                        </span>
                      )}
                    </h3>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', color: '#4b5563', fontSize: '14px' }}>
                    {notification.message}
                  </p>
                  {(notification.deviceBrand || notification.deviceModel) && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px' }}>
                      <strong>Device:</strong> {notification.deviceBrand} {notification.deviceModel}
                    </div>
                  )}
                  {notification.loanId && (
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                      Loan ID: {notification.loanId}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
        <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
          About Notifications
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
          <li>📦 Device Collected - When staff marks your reserved device as collected</li>
          <li>✅ Device Returned - Confirmation when you return a device</li>
          <li>🎉 Device Available - When a device from your waitlist becomes available</li>
          <li>🔒 Device Reserved - Confirmation of your reservation</li>
        </ul>
        <div style={{ marginTop: '12px', fontSize: '12px', color: '#9ca3af' }}>
          ℹ️ Notifications refresh automatically every 30 seconds. Click on unread notifications to mark them as read.
        </div>
      </div>
    </div>
  );
}
