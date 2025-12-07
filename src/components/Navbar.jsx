import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Trifties Bookstore
        </Link>
        
        <div className="navbar-menu">
          <Link to="/books" className="navbar-link">
            Books
          </Link>
          
          {isAuthenticated && (
            <>
              <Link to="/reservations" className="navbar-link">
                My Reservations
              </Link>
              <Link to="/profile" className="navbar-link">
                Profile
              </Link>
            </>
          )}
          
          {isAuthenticated && isAdmin && (
            <Link to="/admin" className="navbar-link">
              Admin
            </Link>
          )}
          
          {isAuthenticated ? (
            <div className="navbar-user">
              <span className="navbar-email">{user?.email}</span>
              <button onClick={handleLogout} className="navbar-logout">
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/signup" className="navbar-link navbar-link-button">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

