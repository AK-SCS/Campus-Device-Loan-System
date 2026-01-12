import { useState, useEffect } from 'react';
import { useAuth0 } from '../auth/useAuth0';
import '../App.css';

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

interface User {
  email: string;
  role: string;
  name?: string;
}

const API_BASE = {
  deviceCatalogue: import.meta.env.VITE_DEVICE_CATALOGUE_API || 'http://localhost:7071/api',
  loanService: import.meta.env.VITE_LOAN_SERVICE_API || 'http://localhost:7072/api'
};

export function AdminDashboard() {
  const { getAccessToken, isAuthenticated, hasRole, loginWithRedirect } = useAuth0();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'loans' | 'users'>('overview');
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [newDevice, setNewDevice] = useState<{
    brand: string;
    model: string;
    category: Device['category'];
    totalCount: number;
    availableCount: number;
  }>({
    brand: '',
    model: '',
    category: 'laptop',
    totalCount: 1,
    availableCount: 1
  });

  const isAdmin = hasRole('admin');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, loginWithRedirect]);

  // Load data
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadAllData();
      const interval = setInterval(loadAllData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, isAdmin]);

  // Access denied for non-admin
  if (isAuthenticated && !isAdmin) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{
          padding: '2rem',
          backgroundColor: '#fee2e2',
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '2rem auto'
        }}>
          <h2 style={{ color: '#991b1b', marginBottom: '1rem' }}>🚫 Access Denied</h2>
          <p style={{ color: '#991b1b', fontSize: '1.1rem' }}>
            You need administrator privileges to access this page.
          </p>
          <p style={{ color: '#6b7280', marginTop: '1rem' }}>
            Please contact your system administrator.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '2rem auto' }}></div>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load devices
      const devicesResponse = await fetch(`${API_BASE.deviceCatalogue}/devices`);
      if (devicesResponse.ok) {
        const devicesData = await devicesResponse.json();
        setDevices(devicesData);
      }

      // Load all loans
      const loansResponse = await fetch(`${API_BASE.loanService}/loans`);
      if (loansResponse.ok) {
        const loansData = await loansResponse.json();
        setLoans(loansData);
      }

      // Mock users data (in real app, would come from Auth0 Management API)
      setUsers([
        { email: 'admin@test.com', role: 'Admin', name: 'System Admin' },
        { email: 'staff@test.com', role: 'Staff', name: 'Staff Member' },
        { email: 'student@test.com', role: 'Student', name: 'Test Student' }
      ]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);

      // Note: This endpoint needs to be created in device-catalogue-service
      const response = await fetch(`${API_BASE.deviceCatalogue}/devices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAccessToken()}`
        },
        body: JSON.stringify(newDevice)
      });

      if (!response.ok) {
        throw new Error('Failed to add device');
      }

      setSuccessMessage('✅ Device added successfully!');
      setShowAddDevice(false);
      setNewDevice({
        brand: '',
        model: '',
        category: 'laptop',
        totalCount: 1,
        availableCount: 1
      });
      
      await loadAllData();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add device');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to delete this device?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE.deviceCatalogue}/devices/${deviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${await getAccessToken()}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete device');
      }

      setSuccessMessage('✅ Device deleted successfully!');
      await loadAllData();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete device');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingDevice) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE.deviceCatalogue}/devices/${editingDevice.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAccessToken()}`
        },
        body: JSON.stringify({
          brand: editingDevice.brand,
          model: editingDevice.model,
          category: editingDevice.category,
          totalCount: editingDevice.totalCount,
          availableCount: editingDevice.availableCount
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update device');
      }

      setSuccessMessage('✅ Device updated successfully!');
      setEditingDevice(null);
      await loadAllData();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update device');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelLoan = async (loanId: string) => {
    if (!confirm('Are you sure you want to cancel this loan?')) {
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
        body: JSON.stringify({ adminOverride: true })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel loan');
      }

      setSuccessMessage('✅ Loan cancelled successfully!');
      await loadAllData();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel loan');
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const stats = {
    totalDevices: devices.length,
    totalInventory: devices.reduce((sum, d) => sum + d.totalCount, 0),
    availableDevices: devices.reduce((sum, d) => sum + d.availableCount, 0),
    totalLoans: loans.length,
    activeLoans: loans.filter(l => l.status !== 'returned').length,
    overdueLoans: loans.filter(l => l.status === 'overdue').length,
    totalUsers: users.length
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔧 Admin Dashboard</h1>
        <p style={{ color: '#6b7280' }}>System administration and management</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#d1fae5',
          borderRadius: '8px',
          marginBottom: '1rem',
          color: '#065f46'
        }}>
          {successMessage}
          <button 
            onClick={() => setSuccessMessage(null)}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee2e2',
          borderRadius: '8px',
          marginBottom: '1rem',
          color: '#991b1b'
        }}>
          {error}
          <button 
            onClick={() => setError(null)}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'overview' ? '3px solid #3b82f6' : 'none',
            color: activeTab === 'overview' ? '#3b82f6' : '#6b7280',
            fontWeight: activeTab === 'overview' ? 'bold' : 'normal',
            cursor: 'pointer'
          }}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('devices')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'devices' ? '3px solid #3b82f6' : 'none',
            color: activeTab === 'devices' ? '#3b82f6' : '#6b7280',
            fontWeight: activeTab === 'devices' ? 'bold' : 'normal',
            cursor: 'pointer'
          }}
        >
          📱 Devices
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'loans' ? '3px solid #3b82f6' : 'none',
            color: activeTab === 'loans' ? '#3b82f6' : '#6b7280',
            fontWeight: activeTab === 'loans' ? 'bold' : 'normal',
            cursor: 'pointer'
          }}
        >
          📋 Loans
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'users' ? '3px solid #3b82f6' : 'none',
            color: activeTab === 'users' ? '#3b82f6' : '#6b7280',
            fontWeight: activeTab === 'users' ? 'bold' : 'normal',
            cursor: 'pointer'
          }}
        >
          👥 Users
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>System Overview</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              padding: '1.5rem',
              backgroundColor: '#dbeafe',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e40af' }}>
                {stats.totalDevices}
              </div>
              <div style={{ color: '#1e3a8a', marginTop: '0.5rem' }}>Device Types</div>
            </div>

            <div style={{
              padding: '1.5rem',
              backgroundColor: '#d1fae5',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#065f46' }}>
                {stats.availableDevices}/{stats.totalInventory}
              </div>
              <div style={{ color: '#064e3b', marginTop: '0.5rem' }}>Available</div>
            </div>

            <div style={{
              padding: '1.5rem',
              backgroundColor: '#fef3c7',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#92400e' }}>
                {stats.activeLoans}
              </div>
              <div style={{ color: '#78350f', marginTop: '0.5rem' }}>Active Loans</div>
            </div>

            <div style={{
              padding: '1.5rem',
              backgroundColor: '#fee2e2',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#991b1b' }}>
                {stats.overdueLoans}
              </div>
              <div style={{ color: '#7f1d1d', marginTop: '0.5rem' }}>Overdue</div>
            </div>

            <div style={{
              padding: '1.5rem',
              backgroundColor: '#e0e7ff',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3730a3' }}>
                {stats.totalUsers}
              </div>
              <div style={{ color: '#312e81', marginTop: '0.5rem' }}>Total Users</div>
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveTab('devices')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                📱 Manage Devices
              </button>
              <button
                onClick={() => setActiveTab('loans')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                📋 View All Loans
              </button>
              <button
                onClick={() => loadAllData()}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem' }}>Device Management</h2>
            <button
              onClick={() => setShowAddDevice(!showAddDevice)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              {showAddDevice ? '✕ Cancel' : '+ Add Device'}
            </button>
          </div>

          {showAddDevice && (
            <form onSubmit={handleAddDevice} style={{
              padding: '1.5rem',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ marginBottom: '1rem' }}>Add New Device</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Brand:</label>
                  <input
                    type="text"
                    value={newDevice.brand}
                    onChange={(e) => setNewDevice({ ...newDevice, brand: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Model:</label>
                  <input
                    type="text"
                    value={newDevice.model}
                    onChange={(e) => setNewDevice({ ...newDevice, model: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category:</label>
                  <select
                    value={newDevice.category}
                    onChange={(e) => setNewDevice({ ...newDevice, category: e.target.value as Device['category'] })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db'
                    }}
                  >
                    <option value="laptop">Laptop</option>
                    <option value="tablet">Tablet</option>
                    <option value="camera">Camera</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem' }}>Total Count:</label>
                  <input
                    type="number"
                    min="1"
                    value={newDevice.totalCount}
                    onChange={(e) => setNewDevice({ 
                      ...newDevice, 
                      totalCount: parseInt(e.target.value),
                      availableCount: parseInt(e.target.value)
                    })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #d1d5db'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.5 : 1
                  }}
                >
                  {loading ? 'Adding...' : 'Add Device'}
                </button>
              </div>
            </form>
          )}

          {/* Edit Device Modal */}
          {editingDevice && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                maxWidth: '500px',
                width: '90%'
              }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Edit Device</h3>
                <form onSubmit={handleEditDevice} style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Brand:</label>
                    <input
                      type="text"
                      value={editingDevice.brand}
                      onChange={(e) => setEditingDevice({ ...editingDevice, brand: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Model:</label>
                    <input
                      type="text"
                      value={editingDevice.model}
                      onChange={(e) => setEditingDevice({ ...editingDevice, model: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category:</label>
                    <select
                      value={editingDevice.category}
                      onChange={(e) => setEditingDevice({ ...editingDevice, category: e.target.value as Device['category'] })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db'
                      }}
                    >
                      <option value="laptop">Laptop</option>
                      <option value="tablet">Tablet</option>
                      <option value="camera">Camera</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Total Count:</label>
                    <input
                      type="number"
                      min="1"
                      value={editingDevice.totalCount}
                      onChange={(e) => setEditingDevice({ ...editingDevice, totalCount: parseInt(e.target.value) })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Available Count:</label>
                    <input
                      type="number"
                      min="0"
                      max={editingDevice.totalCount}
                      value={editingDevice.availableCount}
                      onChange={(e) => setEditingDevice({ ...editingDevice, availableCount: parseInt(e.target.value) })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1
                      }}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingDevice(null)}
                      disabled={loading}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        backgroundColor: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Device</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Category</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Total</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Available</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.map(device => (
                  <tr key={device.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 'bold' }}>{device.brand}</div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{device.model}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{device.category}</td>
                    <td style={{ padding: '1rem' }}>{device.totalCount}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        backgroundColor: device.availableCount > 0 ? '#d1fae5' : '#fee2e2',
                        color: device.availableCount > 0 ? '#065f46' : '#991b1b'
                      }}>
                        {device.availableCount}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => setEditingDevice(device)}
                        disabled={loading}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.5 : 1,
                          marginRight: '0.5rem'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDevice(device.id)}
                        disabled={loading}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          opacity: loading ? 0.5 : 1
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Loans Tab */}
      {activeTab === 'loans' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>All Loans</h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Loan ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>User</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Device</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Due Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(loan => (
                  <tr key={loan.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                      {loan.id.substring(0, 20)}...
                    </td>
                    <td style={{ padding: '1rem' }}>{loan.userId}</td>
                    <td style={{ padding: '1rem' }}>{loan.deviceModel}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        backgroundColor: 
                          loan.status === 'reserved' ? '#fef3c7' :
                          loan.status === 'collected' ? '#dbeafe' :
                          loan.status === 'returned' ? '#d1fae5' : '#fee2e2',
                        color:
                          loan.status === 'reserved' ? '#92400e' :
                          loan.status === 'collected' ? '#1e40af' :
                          loan.status === 'returned' ? '#065f46' : '#991b1b'
                      }}>
                        {loan.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{new Date(loan.dueDate).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem' }}>
                      {loan.status !== 'returned' && (
                        <button
                          onClick={() => handleCancelLoan(loan.id)}
                          disabled={loading}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.5 : 1
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>User Management</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Name</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.email} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>{user.email}</td>
                    <td style={{ padding: '1rem' }}>{user.name || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        backgroundColor:
                          user.role === 'Admin' ? '#fef3c7' :
                          user.role === 'Staff' ? '#dbeafe' : '#d1fae5',
                        color:
                          user.role === 'Admin' ? '#92400e' :
                          user.role === 'Staff' ? '#1e40af' : '#065f46'
                      }}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
