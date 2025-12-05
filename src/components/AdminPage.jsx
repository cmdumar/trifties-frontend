import { useState, useEffect } from 'react';
import { booksAPI, categoriesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './AdminPage.css';

function AdminPage() {
  const { isAdmin, user } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    condition: 'good',
    price: '',
    status: 'available',
    category_id: '',
    published_at: '',
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  useEffect(() => {
    console.log('AdminPage - isAdmin:', isAdmin);
    console.log('AdminPage - user:', user);
    if (!isAdmin) {
      setError('Access denied. Admin privileges required.');
      setLoading(false);
      return;
    }
    fetchBooks();
    fetchCategories();
  }, [isAdmin, user]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await booksAPI.getAll();
      setBooks(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      description: book.description || '',
      condition: book.condition || 'good',
      price: book.price?.toString() || '',
      status: book.status || 'available',
      category_id: book.category?.id?.toString() || '',
      published_at: book.published_at || '',
    });
    setCoverImage(null);
    setCoverImagePreview(book.cover_image_url || null);
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await booksAPI.delete(id);
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete book');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
      };

      if (editingBook) {
        await booksAPI.update(editingBook.id, submitData, coverImage);
      } else {
        await booksAPI.create(submitData, coverImage);
      }

      setShowForm(false);
      setEditingBook(null);
      setCoverImage(null);
      setCoverImagePreview(null);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        description: '',
        condition: 'good',
        price: '',
        status: 'available',
        category_id: '',
        published_at: '',
      });
      fetchBooks();
    } catch (err) {
      setError(err.response?.data?.errors || err.response?.data?.error || 'Operation failed');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBook(null);
    setCoverImage(null);
    setCoverImagePreview(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      description: '',
      condition: 'good',
      price: '',
      status: 'available',
      category_id: '',
      published_at: '',
    });
  };

  if (!isAdmin) {
    return (
      <div className="admin-container">
        <div className="error-message">
          <h2>Access Denied</h2>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Panel - Book Management</h1>
        <button onClick={() => setShowForm(true)} className="btn-add">
          + Add New Book
        </button>
      </div>

      {error && (
        <div className="error-message">
          {Array.isArray(error) ? error.join(', ') : error}
        </div>
      )}

      {showForm && (
        <div className="form-overlay">
          <div className="form-modal">
            <h2>{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={handleSubmit} className="book-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Author</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ISBN</label>
                  <input
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Condition</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Published Date</label>
                  <input
                    type="date"
                    name="published_at"
                    value={formData.published_at}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Cover Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {coverImagePreview && (
                  <div className="image-preview">
                    <img src={coverImagePreview} alt="Cover preview" />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingBook ? 'Update Book' : 'Create Book'}
                </button>
                <button type="button" onClick={handleCancel} className="btn-cancel">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="books-table-container">
        <table className="books-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Category</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-books">No books found</td>
              </tr>
            ) : (
              books.map(book => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author || 'N/A'}</td>
                  <td>{book.category?.name || 'N/A'}</td>
                  <td>${book.price?.toFixed(2) || '0.00'}</td>
                  <td>
                    <span className={`status-badge status-${book.status}`}>
                      {book.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleEdit(book)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(book.id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPage;

