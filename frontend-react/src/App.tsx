import { useState, useEffect } from 'react'
import './App.css'
import { useAuth0 } from './auth/useAuth0'
import { AuthenticationButton } from './auth/AuthButtons'
import { StaffManagement } from './pages/StaffManagement'
import { AdminDashboard } from './pages/AdminDashboard'
import Notifications from './pages/Notifications'

interface Device {
  id: string;
  brand: string;
  model: string;
  category: 'laptop' | 'tablet' | 'camera' | 'other';
  totalCount: number;
  availableCount: number;
}

interface Loan {
  id: string;
  userId: string;
  deviceId: string;
  deviceModel: string;
  status: 'reserved' | 'collected' | 'returned' | 'overdue';
  reservedAt: string;
  dueDate: string;
  collectedAt?: string;
  returnedAt?: string;
}

interface ServiceStatus {
  deviceCatalogue: boolean;
  loanService: boolean;
  emailService: boolean;
}

type ViewMode = 'catalogue' | 'my-loans' | 'overdue' | 'notifications' | 'staff' | 'admin';

const API_BASE = {
  deviceCatalogue: import.meta.env.VITE_DEVICE_CATALOGUE_API || 'https://campus-device-catalogue.azurewebsites.net/api',
  loanService: import.meta.env.VITE_LOAN_SERVICE_API || 'https://campus-loan-service.azurewebsites.net/api',
  emailService: import.meta.env.VITE_EMAIL_SERVICE_API || 'https://campus-email-notification.azurewebsites.net/api'
};

function App() {
  const { isAuthenticated, user, getAccessToken, hasRole, loginWithRedirect } = useAuth0();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('catalogue');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availableOnlyFilter, setAvailableOnlyFilter] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>({
    deviceCatalogue: false,
    loanService: false,
    emailService: false
  });

  // Debug: Log user roles
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('=== Current User Info ===');
      console.log('Email:', user.email);
      console.log('Roles from token:', user['https://campus-device-loan.com/roles']);
      console.log('Has staff role:', hasRole('staff'));
      console.log('Has admin role:', hasRole('admin'));
      console.log('=======================');
    }
  }, [isAuthenticated, user, hasRole]);

  // Set default view based on user role
  useEffect(() => {
    if (isAuthenticated) {
      if (hasRole('admin')) {
        setViewMode('admin');
      } else if (hasRole('staff')) {
        setViewMode('staff');
      } else {
        setViewMode('catalogue');
      }
    }
  }, [isAuthenticated, hasRole]);

  // Load devices on mount
  useEffect(() => {
    loadDevices();
    checkServiceStatus();
    const interval = setInterval(checkServiceStatus, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, availableOnlyFilter]);

  // Load loans when viewing my loans
  useEffect(() => {
    if (viewMode === 'my-loans' && isAuthenticated) {
      loadMyLoans();
    } else if (viewMode === 'overdue') {
      loadOverdueLoans();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, isAuthenticated]);

  const loadDevices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `${API_BASE.deviceCatalogue}/devices`;
      const params = new URLSearchParams();
      
      if (categoryFilter !== 'all') {
        params.append('category', categoryFilter);
      }
      if (availableOnlyFilter) {
        params.append('availableOnly', 'true');
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to load devices');
      }
      
      const data = await response.json();
      setDevices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch devices');
      console.error('Error loading devices:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMyLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE.loanService}/loans?userId=${encodeURIComponent(user?.email || '')}`);
      
      if (!response.ok) {
        throw new Error('Failed to load loans');
      }
      
      const data = await response.json();
      setLoans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loans');
      console.error('Error loading loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOverdueLoans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE.loanService}/overdue-loans`);
      
      if (!response.ok) {
        throw new Error('Failed to load overdue loans');
      }
      
      const data = await response.json();
      setLoans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch overdue loans');
      console.error('Error loading overdue loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkServiceStatus = async () => {
    const newStatus: ServiceStatus = {
      deviceCatalogue: false,
      loanService: false,
      emailService: false
    };

    try {
      const response = await fetch(`${API_BASE.deviceCatalogue}/devices`, { 
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      newStatus.deviceCatalogue = response.ok;
    } catch {
      // Service unavailable
    }

    try {
      const response = await fetch(`${API_BASE.loanService}/loans`, { 
        method: 'GET',
        signal: AbortSignal.timeout(3000)
      });
      newStatus.loanService = response.ok;
    } catch {
      // Service unavailable
    }

    newStatus.emailService = true; // Assume running if others are

    setServiceStatus(newStatus);
  };

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    setSuccessMessage(null);
  };

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Redirect to login when trying to reserve without authentication
      loginWithRedirect();
      return;
    }

    if (!selectedDevice) {
      setError('Please select a device first');
      return;
    }

    if (selectedDevice.availableCount === 0) {
      setError('This device is currently unavailable');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = await getAccessToken();
      
      const response = await fetch(`${API_BASE.loanService}/loans/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user?.email || '',
          deviceId: selectedDevice.id,
          userEmail: user?.email || '',
          userName: user?.name || user?.email || 'User'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to reserve device');
      }

      const loan = await response.json();
      
      setSuccessMessage(
        `✅ Reservation successful! Loan ID: ${loan.loanId}. ` +
        `Due date: ${new Date(loan.dueDate).toLocaleDateString()}`
      );
      
      // Reload devices to update availability
      await loadDevices();
      setSelectedDevice(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reserve device');
      console.error('Reservation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLoan = async (loanId: string) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE.loanService}/loans/${loanId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.email || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel reservation');
      }
      
      setSuccessMessage('✅ Reservation cancelled successfully. Device returned to inventory.');
      
      // Reload loans and devices
      await loadMyLoans();
      await loadDevices();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel reservation');
      console.error('Cancel error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch(category) {
      case 'laptop': return '💻';
      case 'tablet': return '📱';
      case 'camera': return '📷';
      default: return '🔧';
    }
  };

  const getAvailabilityClass = (available: number) => {
    if (available === 0) return 'unavailable';
    if (available <= 2) return 'limited';
    return 'available';
  };

  const getStatusBadgeClass = (status: string) => {
    switch(status) {
      case 'reserved': return 'status-reserved';
      case 'collected': return 'status-collected';
      case 'returned': return 'status-returned';
      case 'overdue': return 'status-overdue';
      default: return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderCatalogueView = () => (
    <>
      <div className="panel catalogue-panel">
        <h2>📱 Available Devices</h2>
        
        {/* Filters */}
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <select 
              id="category-filter" 
              value={categoryFilter} 
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="laptop">💻 Laptops</option>
              <option value="tablet">📱 Tablets</option>
              <option value="camera">📷 Cameras</option>
              <option value="other">🔧 Other</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>
              <input
                type="checkbox"
                checked={availableOnlyFilter}
                onChange={(e) => setAvailableOnlyFilter(e.target.checked)}
              />
              Available only
            </label>
          </div>
        </div>

        <p className="panel-info">
          ℹ️ Browse Devices: Click on any device to view details and reserve it.
        </p>

        {error && !successMessage && (
          <div className="error-message">{error}</div>
        )}

        {loading && devices.length === 0 ? (
          <div className="loading">Loading devices...</div>
        ) : (
          <div className="device-grid">
            {devices.map(device => (
              <div
                key={device.id}
                className={`device-card ${selectedDevice?.id === device.id ? 'selected' : ''}`}
                onClick={() => handleDeviceSelect(device)}
              >
                <div className="device-icon">{getCategoryEmoji(device.category)}</div>
                <h3>{device.brand} {device.model}</h3>
                <p className="device-category">{device.category}</p>
                <div className="device-availability">
                  <span className={`availability-badge ${getAvailabilityClass(device.availableCount)}`}>
                    {device.availableCount}/{device.totalCount} available
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel reservation-panel">
        <h2>📝 Reserve Device</h2>
        <p className="loan-period">⏱️ Loan Period: 2 days (48 hours)</p>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleReservation}>
          <div className="form-group">
            <label>Selected Device</label>
            <div className="selected-device-display">
              {selectedDevice ? (
                <>
                  {getCategoryEmoji(selectedDevice.category)}
                  {selectedDevice.brand} {selectedDevice.model}
                  <span className={`availability-badge ${getAvailabilityClass(selectedDevice.availableCount)}`}>
                    {selectedDevice.availableCount} available
                  </span>
                </>
              ) : (
                'Select a device from the list'
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary btn-reserve"
            disabled={!isAuthenticated || !selectedDevice || loading}
          >
            {loading ? 'Processing...' : 'Reserve Device'}
          </button>

          {/* Join Waitlist Button */}
          {selectedDevice && selectedDevice.availableCount === 0 && (
            <button
              type="button"
              className="btn-secondary"
              onClick={async () => {
                if (!isAuthenticated) {
                  loginWithRedirect();
                  return;
                }

                try {
                  setLoading(true);
                  setError(null);

                  const token = await getAccessToken();
                  const response = await fetch(`${API_BASE.loanService}/waitlist`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      userId: user?.email || '',
                      userEmail: user?.email || '',
                      userName: user?.name || user?.email || '',
                      deviceId: selectedDevice.id,
                      deviceBrand: selectedDevice.brand,
                      deviceModel: selectedDevice.model
                    })
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    if (response.status === 409) {
                      setError('You are already on the waitlist for this device');
                    } else {
                      throw new Error(errorData.error || 'Failed to join waitlist');
                    }
                  } else {
                    setSuccessMessage(`✅ Added to waitlist for ${selectedDevice.brand} ${selectedDevice.model}! You'll be notified when it becomes available.`);
                  }

                } catch (err) {
                  setError(err instanceof Error ? err.message : 'Failed to join waitlist');
                } finally {
                  setLoading(false);
                }
              }}
              disabled={!isAuthenticated || loading}
              style={{
                marginTop: '0.5rem',
                backgroundColor: '#f59e0b',
                color: 'white'
              }}
            >
              📋 Join Waitlist
            </button>
          )}
        </form>
      </div>
    </>
  );

  const renderMyLoansView = () => (
    <div className="panel loans-panel">
      <h2>📋 My Loans</h2>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      {loading ? (
        <div className="loading">Loading your loans...</div>
      ) : loans.length === 0 ? (
        <div className="empty-state">
          <p>📭 You have no active loans.</p>
          <button 
            className="btn-primary" 
            onClick={() => setViewMode('catalogue')}
          >
            Browse Devices
          </button>
        </div>
      ) : (
        <div className="loans-list">
          {loans.map(loan => (
            <div key={loan.id} className="loan-card">
              <div className="loan-header">
                <h3>{loan.deviceModel}</h3>
                <span className={`status-badge ${getStatusBadgeClass(loan.status)}`}>
                  {loan.status.toUpperCase()}
                </span>
              </div>
              
              <div className="loan-details">
                <p><strong>Loan ID:</strong> {loan.id}</p>
                <p><strong>Reserved:</strong> {formatDate(loan.reservedAt)}</p>
                <p><strong>Due Date:</strong> {formatDate(loan.dueDate)}</p>
                {loan.collectedAt && (
                  <p><strong>Collected:</strong> {formatDate(loan.collectedAt)}</p>
                )}
                {loan.returnedAt && (
                  <p><strong>Returned:</strong> {formatDate(loan.returnedAt)}</p>
                )}
              </div>

              {loan.status === 'reserved' && (
                <button
                  className="btn-danger"
                  onClick={() => handleCancelLoan(loan.id)}
                  disabled={loading}
                >
                  Cancel Reservation
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderOverdueView = () => (
    <div className="panel overdue-panel">
      <h2>⚠️ Overdue Loans</h2>
      
      {error && (
        <div className="error-message">{error}</div>
      )}

      {loading ? (
        <div className="loading">Loading overdue loans...</div>
      ) : loans.length === 0 ? (
        <div className="empty-state">
          <p>✅ No overdue loans found!</p>
        </div>
      ) : (
        <div className="loans-list">
          {loans.map(loan => (
            <div key={loan.id} className="loan-card overdue">
              <div className="loan-header">
                <h3>{loan.deviceModel}</h3>
                <span className="status-badge status-overdue">
                  OVERDUE
                </span>
              </div>
              
              <div className="loan-details">
                <p><strong>User:</strong> {loan.userId}</p>
                <p><strong>Loan ID:</strong> {loan.id}</p>
                <p><strong>Due Date:</strong> {formatDate(loan.dueDate)}</p>
                <p className="overdue-warning">
                  ⚠️ This loan is overdue! Please contact the user immediately.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>🎓 Campus Device Loan System</h1>
        
        <nav className="nav-tabs">
          {/* Device Catalogue - always visible to everyone */}
          <button
            className={`nav-tab ${viewMode === 'catalogue' ? 'active' : ''}`}
            onClick={() => setViewMode('catalogue')}
          >
            📱 Devices
          </button>

          {/* Authenticated user tabs */}
          {isAuthenticated && (
            <>
              <button
                className={`nav-tab ${viewMode === 'my-loans' ? 'active' : ''}`}
                onClick={() => setViewMode('my-loans')}
              >
                📋 My Loans
              </button>
              <button
                className={`nav-tab ${viewMode === 'notifications' ? 'active' : ''}`}
                onClick={() => setViewMode('notifications')}
              >
                📬 Notifications
              </button>
              <button
                className={`nav-tab ${viewMode === 'overdue' ? 'active' : ''}`}
                onClick={() => setViewMode('overdue')}
              >
                ⚠️ Overdue
              </button>

              {/* Staff Management - visible to staff and admin */}
              {(hasRole('staff') || hasRole('admin')) && (
                <button
                  className={`nav-tab ${viewMode === 'staff' ? 'active' : ''}`}
                  onClick={() => setViewMode('staff')}
                >
                  👨‍💼 Staff Management
                </button>
              )}

              {/* Admin Dashboard - visible to admin only */}
              {hasRole('admin') && (
                <button
                  className={`nav-tab ${viewMode === 'admin' ? 'active' : ''}`}
                  onClick={() => setViewMode('admin')}
                >
                  🔧 Admin
                </button>
              )}
            </>
          )}
        </nav>

        <div className="auth-section">
          <AuthenticationButton />
        </div>
      </header>

      {/* Main Content */}
      <div className="content">
        {viewMode === 'catalogue' && renderCatalogueView()}
        {viewMode === 'my-loans' && renderMyLoansView()}
        {viewMode === 'notifications' && <Notifications />}
        {viewMode === 'overdue' && renderOverdueView()}
        {viewMode === 'staff' && <StaffManagement />}
        {viewMode === 'admin' && <AdminDashboard />}
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="service-status">
          <span>Service Status:</span>
          <span className={`status-indicator ${serviceStatus.deviceCatalogue ? 'online' : 'offline'}`}>
            {serviceStatus.deviceCatalogue ? '🟢' : '🔴'} Device Catalogue
          </span>
          <span className={`status-indicator ${serviceStatus.loanService ? 'online' : 'offline'}`}>
            {serviceStatus.loanService ? '🟢' : '🔴'} Loan Service
          </span>
          <span className={`status-indicator ${serviceStatus.emailService ? 'online' : 'offline'}`}>
            {serviceStatus.emailService ? '🟢' : '🔴'} Email Service
          </span>
        </div>
      </footer>
    </div>
  )
}

export default App
