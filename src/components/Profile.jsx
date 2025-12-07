import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import BookPlaceholder from './BookPlaceholder';
import './Profile.css';

function Profile() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileAPI.getProfile();
      setProfile(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={fetchProfile}>Try Again</button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-container">
        <div className="error">No profile data available</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h2>Account Information</h2>
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{profile.user.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Account Type:</span>
              <span className="info-value">
                {profile.user.admin ? 'Administrator' : 'User'}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Member Since:</span>
              <span className="info-value">{formatDate(profile.user.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Reservation Summary</h2>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="summary-number">{profile.reservations_summary.total}</div>
              <div className="summary-label">Total Reservations</div>
            </div>
            <div className="summary-card active">
              <div className="summary-number">{profile.reservations_summary.active}</div>
              <div className="summary-label">Active</div>
            </div>
            <div className="summary-card cancelled">
              <div className="summary-number">{profile.reservations_summary.cancelled}</div>
              <div className="summary-label">Cancelled</div>
            </div>
            <div className="summary-card completed">
              <div className="summary-number">{profile.reservations_summary.completed}</div>
              <div className="summary-label">Completed</div>
            </div>
          </div>
        </div>

        {profile.recent_reservations && profile.recent_reservations.length > 0 && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Recent Reservations</h2>
              <Link to="/reservations" className="view-all-link">
                View All →
              </Link>
            </div>
            <div className="recent-reservations">
              {profile.recent_reservations.map((reservation) => (
                <div key={reservation.id} className="recent-reservation-card">
                  <div className="recent-book-cover">
                    {reservation.book.cover_image_url ? (
                      <img src={reservation.book.cover_image_url} alt={reservation.book.title} />
                    ) : (
                      <BookPlaceholder />
                    )}
                  </div>
                  <div className="recent-book-info">
                    <h3>{reservation.book.title}</h3>
                    <p className="recent-book-author">{reservation.book.author}</p>
                    <p className="recent-book-price">{formatPrice(reservation.book.price)}</p>
                    <span className={`recent-status status-${reservation.status}`}>
                      {reservation.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="profile-actions">
          <Link to="/reservations" className="action-button primary">
            View All Reservations
          </Link>
          <Link to="/books" className="action-button secondary">
            Browse Books
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;

