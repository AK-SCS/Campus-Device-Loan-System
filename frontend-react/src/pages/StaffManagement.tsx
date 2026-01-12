import { useState, useEffect } from 'react';
import { useAuth0 } from '../auth/useAuth0';
import '../App.css';

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

const API_BASE = {
  loanService: import.meta.env.VITE_LOAN_SERVICE_API || 'http://localhost:7072/api'
};

export function StaffManagement() {
  const { getAccessToken, isAuthenticated, hasRole, loginWithRedirect } = useAuth0();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const isStaff = hasRole('staff') || hasRole('admin');

  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthenticated, loginWithRedirect]);

  useEffect(() => {
    if (isAuthenticated && isStaff) {
      loadAllLoans();
      const interval = setInterval(loadAllLoans, 30000); 
      return () => clearInterval(interval);
    }

  }, [statusFilter, isAuthenticated, isStaff]);

  if (isAuthenticated && !isStaff) {
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
            You need staff privileges to access this page.
          </p>
          <p style={{ color: '#6b7280', marginTop: '1rem' }}>
            Please contact your administrator if you believe you should have access.
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

  const loadAllLoans = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `${API_BASE.loanService}/loans`;
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      try {
        const token = await getAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch {

      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`Failed to load loans: ${response.statusText}`);
      }

      const data = await response.json();
      setLoans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load loans');
      console.error('Error loading loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCollected = async (loanId: string) => {
    try {
      setError(null);
      setSuccessMessage(null);

      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      try {
        const token = await getAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch {

      }

      const response = await fetch(
        `${API_BASE.loanService}/loans/${loanId}/collect`,
        {
          method: 'POST',
          headers
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to mark as collected');
      }

      setSuccessMessage('Device marked as collected successfully!');
      await loadAllLoans(); 

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as collected');
      console.error('Error marking as collected:', err);
    }
  };

  const handleMarkAsReturned = async (loanId: string) => {
    try {
      setError(null);
      setSuccessMessage(null);

      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };

      try {
        const token = await getAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch {

      }

      const response = await fetch(
        `${API_BASE.loanService}/loans/${loanId}/return`,
        {
          method: 'POST',
          headers
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to mark as returned');
      }

      setSuccessMessage('Device marked as returned successfully!');
      await loadAllLoans(); 

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as returned');
      console.error('Error marking as returned:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reserved': return '#3b82f6'; 
      case 'collected': return '#f59e0b'; 
      case 'returned': return '#10b981'; 
      case 'overdue': return '#ef4444'; 
      default: return '#6b7280'; 
    }
  };

  const isOverdue = (loan: Loan) => {
    if (loan.status === 'returned') return false;
    return new Date(loan.dueDate) < new Date();
  };

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.deviceModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const stats = {
    total: loans.length,
    reserved: loans.filter(l => l.status === 'reserved').length,
    collected: loans.filter(l => l.status === 'collected').length,
    returned: loans.filter(l => l.status === 'returned').length,
    overdue: loans.filter(l => isOverdue(l) && l.status !== 'returned').length
  };

  if (loading && loans.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '2rem auto' }}></div>
        <p>Loading loans...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>📋 Staff Management Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Manage device reservations, collections, and returns
      </p>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#fee2e2', 
          color: '#991b1b',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          ❌ {error}
        </div>
      )}

      {successMessage && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: '#d1fae5', 
          color: '#065f46',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          ✅ {successMessage}
        </div>
      )}

      {}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
            {stats.total}
          </div>
          <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Total Loans</div>
        </div>

        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: '#dbeafe',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.reserved}
          </div>
          <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Reserved</div>
        </div>

        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: '#fed7aa',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.collected}
          </div>
          <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Collected</div>
        </div>

        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: '#d1fae5',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {stats.returned}
          </div>
          <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Returned</div>
        </div>

        <div style={{ 
          padding: '1.5rem', 
          backgroundColor: '#fee2e2',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
            {stats.overdue}
          </div>
          <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Overdue</div>
        </div>
      </div>

      {}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <input
            type="text"
            placeholder="🔍 Search by user, device, or loan ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              fontSize: '1rem'
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            border: '2px solid #e5e7eb',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          <option value="all">All Status</option>
          <option value="reserved">Reserved</option>
          <option value="collected">Collected</option>
          <option value="returned">Returned</option>
          <option value="overdue">Overdue</option>
        </select>

        <button
          onClick={loadAllLoans}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {}
      {filteredLoans.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
            {searchTerm ? 'No loans match your search' : 'No loans found'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  Loan ID
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  User
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  Device
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  Reserved
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  Due Date
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  Status
                </th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #e5e7eb' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map(loan => (
                <tr 
                  key={loan.id}
                  style={{ 
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: isOverdue(loan) && loan.status !== 'returned' ? '#fef2f2' : 'white'
                  }}
                >
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                    {loan.id.substring(0, 20)}...
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {loan.userId}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>
                    {loan.deviceModel}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {new Date(loan.reservedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                    {new Date(loan.dueDate).toLocaleDateString()}
                    {isOverdue(loan) && loan.status !== 'returned' && (
                      <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>⚠️</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      backgroundColor: `${getStatusColor(loan.status)}20`,
                      color: getStatusColor(loan.status)
                    }}>
                      {loan.status.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                      {loan.status === 'reserved' && (
                        <button
                          onClick={() => handleMarkAsCollected(loan.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          ✓ Mark Collected
                        </button>
                      )}
                      {loan.status === 'collected' && (
                        <button
                          onClick={() => handleMarkAsReturned(loan.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          ✓ Mark Returned
                        </button>
                      )}
                      {loan.status === 'returned' && (
                        <span style={{ color: '#10b981', fontSize: '0.875rem' }}>
                          ✓ Complete
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: '#6b7280'
      }}>
        <strong>Total: {filteredLoans.length} loans</strong>
        {searchTerm && ` (filtered from ${loans.length} total)`}
      </div>
    </div>
  );
}
