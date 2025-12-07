import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reservationsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import BookPlaceholder from './BookPlaceholder';
import './Reservations.css';

function Reservations() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total_count: 0,
    total_pages: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchReservations();
  }, [isAuthenticated, statusFilter, pagination.page]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.page,
        per_page: pagination.per_page,
      };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const response = await reservationsAPI.getAll(params);
      setReservations(response.data.reservations || []);
      setPagination(response.data.pagination || pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch reservations');
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      await reservationsAPI.cancel(reservationId);
      // Refresh the list
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel reservation');
      console.error('Error cancelling reservation:', err);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { text: 'Active', class: 'status-active' },
      cancelled: { text: 'Cancelled', class: 'status-cancelled' },
      completed: { text: 'Completed', class: 'status-completed' },
    };
    const statusInfo = statusMap[status] || { text: status, class: 'status-unknown' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  if (loading) {
    return (
      <div className="reservations-container">
        <div className="loading">Loading reservations...</div>
      </div>
    );
  }

  return (
    <div className="reservations-container">
      <div className="reservations-header">
        <h1>My Reservations</h1>
        <p className="reservations-count">
          {pagination.total_count} {pagination.total_count === 1 ? 'reservation' : 'reservations'}
        </p>
      </div>

      <div className="reservations-filters">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPagination({ ...pagination, page: 1 });
          }}
          className="status-filter"
        >
          <option value="all">All Reservations</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && (
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={fetchReservations}>Try Again</button>
        </div>
      )}

      {reservations.length === 0 ? (
        <div className="no-reservations">
          <p>You don't have any reservations yet.</p>
          <p className="no-reservations-hint">Browse books and reserve your favorites!</p>
        </div>
      ) : (
        <>
          <div className="reservations-grid">
            {reservations.map((reservation) => (
              <div key={reservation.id} className="reservation-card">
                <div className="reservation-book">
                  <div className="book-cover-small">
                    {reservation.book.cover_image_url ? (
                      <img src={reservation.book.cover_image_url} alt={reservation.book.title} />
                    ) : (
                      <BookPlaceholder />
                    )}
                  </div>
                  <div className="book-info">
                    <h3 className="book-title">{reservation.book.title}</h3>
                    <p className="book-author">{reservation.book.author || 'Unknown'}</p>
                    {reservation.book.category && (
                      <p className="book-category">{reservation.book.category.name}</p>
                    )}
                    <p className="book-price">{formatPrice(reservation.book.price)}</p>
                  </div>
                </div>

                <div className="reservation-details">
                  <div className="reservation-status-row">
                    {getStatusBadge(reservation.status)}
                    {reservation.days_remaining !== null && reservation.status === 'active' && (
                      <span className="days-remaining">
                        {reservation.days_remaining} {reservation.days_remaining === 1 ? 'day' : 'days'} remaining
                      </span>
                    )}
                  </div>
                  
                  <div className="reservation-dates">
                    <p>
                      <strong>Reserved:</strong> {formatDate(reservation.reserved_at)}
                    </p>
                    {reservation.expires_at && (
                      <p>
                        <strong>Expires:</strong> {formatDate(reservation.expires_at)}
                      </p>
                    )}
                  </div>

                  {reservation.note && (
                    <div className="reservation-note">
                      <strong>Note:</strong> {reservation.note}
                    </div>
                  )}

                  {reservation.status === 'active' && (
                    <button
                      onClick={() => handleCancelReservation(reservation.id)}
                      className="cancel-reservation-btn"
                    >
                      Cancel Reservation
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {pagination.total_pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="pagination-btn"
              >
                Previous
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.total_pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.total_pages}
                className="pagination-btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Reservations;

