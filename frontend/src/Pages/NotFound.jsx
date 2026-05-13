import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="notfound-page">
      {/* MentorMatrix Logo or Icon */}
      <div className="notfound-brand">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="24" fill="url(#mm-gradient)" />
          <path d="M24 13L32 35H16L24 13Z" fill="#fff" fillOpacity="0.95" />
          <defs>
            <linearGradient id="mm-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366f1" stopOpacity="0.2" />
              <stop offset="0.5" stopColor="#6366f1" stopOpacity="0.05" />
              <stop offset="1" stopColor="#6366f1" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
        <span className="notfound-brand-text">MentorMatrix</span>
      </div>
      <h1 className="notfound-code">404</h1>
      <h2 className="notfound-title">Page Not Found</h2>
      <p className="notfound-text">
        Oops! The page you're looking for doesn't exist or has been moved.<br />
        Let's get you back on track with MentorMatrix.
      </p>
      <Link to="/" className="notfound-action">
        Go Home
      </Link>
      {/* Decorative SVG */}
      <div className="notfound-deco">
        <svg width="320" height="80" viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="160" cy="70" rx="120" ry="10" fill="#6366f1" fillOpacity="0.08" />
          <path d="M90 50 Q160 10 230 50" stroke="#6366f1" strokeWidth="4" fill="none" />
          <circle cx="130" cy="50" r="8" fill="#6366f1" />
          <circle cx="190" cy="50" r="8" fill="#6366f1" />
        </svg>
      </div>
    </div>
  );
};

export default NotFound;
