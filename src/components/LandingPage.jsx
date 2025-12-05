import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LandingPage.css';

function LandingPage() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="container">
          <h1 className="landing-title">Book Inventory</h1>
          <p className="landing-subtitle">Discover and manage your book collection</p>
        </div>
      </header>

      <main className="landing-main">
        <div className="container">
          <section className="hero-section">
            <h2>Welcome to Book Inventory</h2>
            <p>
              Browse through our extensive collection of books. Search by title, author, 
              or category. Find your next great read!
            </p>
            
            <div className="cta-buttons">
              <Link to="/books" className="btn btn-primary">
                Browse Books
              </Link>
              {!isAuthenticated && (
                <Link to="/login" className="btn btn-secondary">
                  Sign In
                </Link>
              )}
              {isAuthenticated && isAdmin && (
                <Link to="/admin" className="btn btn-admin">
                  Admin Panel
                </Link>
              )}
            </div>
          </section>

          <section className="features-section">
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">📚</div>
                <h3>Browse Books</h3>
                <p>Explore our collection of books with detailed information about each title.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🔍</div>
                <h3>Search & Filter</h3>
                <p>Find books quickly by searching by title, author, or category.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">📖</div>
                <h3>Book Details</h3>
                <p>View comprehensive information including price, condition, and availability.</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">👤</div>
                <h3>User Accounts</h3>
                <p>Create an account to reserve books and manage your reading list.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2025 Book Inventory. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;

