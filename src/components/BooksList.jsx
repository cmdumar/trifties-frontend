import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { booksAPI, reservationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import BookPlaceholder from './BookPlaceholder';
import './BooksList.css';

function BooksList() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('title'); // 'title' or 'author'
  const [reservingBookId, setReservingBookId] = useState(null);

  useEffect(() => {
    if (searchTerm.trim()) {
      // Debounce search
      const timer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      fetchBooks();
    }
  }, [searchTerm, searchType]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await booksAPI.getAll();
      setBooks(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch books');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchType === 'title') {
        params.title = searchTerm;
      } else if (searchType === 'author') {
        params.author = searchTerm;
      }
      const response = await booksAPI.search(params);
      setBooks(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed');
      console.error('Error searching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setSearchTerm(''); // Clear search when changing type
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchBooks();
  };

  const handleReserveBook = async (bookId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!window.confirm('Are you sure you want to reserve this book?')) {
      return;
    }

    try {
      setReservingBookId(bookId);
      await reservationsAPI.create(bookId);
      alert('Book reserved successfully!');
      // Optionally refresh the books list to update status
      fetchBooks();
    } catch (err) {
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.errors?.join(', ') ||
                      'Failed to reserve book';
      alert(errorMsg);
      console.error('Error reserving book:', err);
    } finally {
      setReservingBookId(null);
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
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      available: { text: 'Available', class: 'status-available' },
      reserved: { text: 'Reserved', class: 'status-reserved' },
      sold: { text: 'Sold', class: 'status-sold' },
    };
    const statusInfo = statusMap[status] || { text: status, class: 'status-unknown' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return (
      <div className="books-container">
        <div className="loading">Loading books...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="books-container">
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={fetchBooks}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="books-container">
      <div className="books-header">
        <h1>Book Inventory</h1>
        <p className="books-count">{books.length} {books.length === 1 ? 'book' : 'books'} {searchTerm ? 'found' : 'available'}</p>
      </div>

      <div className="search-section">
        <div className="search-controls">
          <select 
            value={searchType} 
            onChange={handleSearchTypeChange}
            className="search-type-select"
          >
            <option value="title">Search by Title</option>
            <option value="author">Search by Author</option>
          </select>
          <div className="search-input-group">
            <input
              type="text"
              placeholder={`Search by ${searchType}...`}
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchTerm && (
              <button onClick={clearSearch} className="clear-search-btn">
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="no-books">
          <p>No books found in the inventory.</p>
        </div>
      ) : (
        <div className="books-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <div className="book-cover">
                {book.cover_image_url ? (
                  <img src={book.cover_image_url} alt={book.title} />
                ) : (
                  <BookPlaceholder />
                )}
              </div>
              <div className="book-header">
                <h2 className="book-title">{book.title}</h2>
                {getStatusBadge(book.status)}
              </div>
              
              <div className="book-details">
                <p className="book-author">
                  <strong>Author:</strong> {book.author || 'Unknown'}
                </p>
                
                {book.category && (
                  <p className="book-category">
                    <strong>Category:</strong> {book.category.name}
                  </p>
                )}
                
                <p className="book-price">
                  <strong>Price:</strong> {formatPrice(book.price)}
                </p>
                
                <p className="book-condition">
                  <strong>Condition:</strong> {book.condition || 'N/A'}
                </p>
                
                {book.isbn && (
                  <p className="book-isbn">
                    <strong>ISBN:</strong> {book.isbn}
                  </p>
                )}
                
                {book.published_at && (
                  <p className="book-published">
                    <strong>Published:</strong> {formatDate(book.published_at)}
                  </p>
                )}
              </div>
              
              {book.description && (
                <div className="book-description">
                  <p>{book.description}</p>
                </div>
              )}
              
              {isAuthenticated && book.status === 'available' && (
                <div className="book-actions">
                  <button
                    onClick={() => handleReserveBook(book.id)}
                    disabled={reservingBookId === book.id}
                    className="reserve-btn"
                  >
                    {reservingBookId === book.id ? 'Reserving...' : 'Reserve Book'}
                  </button>
                </div>
              )}
              
              {isAuthenticated && book.status === 'reserved' && (
                <div className="book-actions">
                  <button disabled className="reserve-btn disabled">
                    Already Reserved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BooksList;

