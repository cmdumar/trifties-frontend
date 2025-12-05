function BookPlaceholder() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="book-placeholder"
    >
      <rect width="200" height="280" fill="url(#gradient)" />
      <path
        d="M60 80L140 80L140 200L60 200L60 80Z"
        fill="white"
        fillOpacity="0.2"
      />
      <path
        d="M70 100L130 100M70 120L130 120M70 140L130 140M70 160L110 160"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
      <defs>
        <linearGradient id="gradient" x1="0" y1="0" x2="200" y2="280">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default BookPlaceholder;

