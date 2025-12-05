# Inventory Frontend

React frontend application for the Book Inventory API.

## Features

- View all books in the inventory
- Beautiful, responsive card-based layout
- Real-time data from Rails API backend

## Getting Started

### Prerequisites

- Node.js (v20.19.0 or >=22.12.0)
- npm or yarn
- Rails API backend running (see `/Users/umar/inventory_api`)

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

1. **Start your Rails API server on port 3001:**
   ```bash
   cd /Users/umar/inventory_api
   PORT=3001 rails server
   ```
   (React dev server uses port 3000, so Rails should use 3001 to avoid conflicts)

2. **Start the React development server:**
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

**Note:** If you need to use a different port for Rails, update the `baseURL` in `src/services/api.js` or set the `VITE_API_BASE_URL` environment variable.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
  ├── components/
  │   ├── BooksList.jsx      # Main component for displaying books
  │   └── BooksList.css       # Styles for books list
  ├── services/
  │   └── api.js             # API service for backend communication
  ├── App.jsx                # Main app component
  └── main.jsx               # Entry point
```

## API Configuration

The API base URL is configured in `src/services/api.js`. By default, it points to:
- `http://localhost:3001/api/v1`

If your Rails server runs on a different port, update the `baseURL` in the api.js file.

## Features to Add

- [ ] User authentication (login/signup)
- [ ] Search and filter functionality
- [ ] Book details page
- [ ] Create/Edit/Delete books (for authenticated users)
- [ ] Category filtering
- [ ] Pagination
