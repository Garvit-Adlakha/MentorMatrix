import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 via-primary/5 to-primary/10 relative overflow-hidden">
      {/* MentorMatrix Logo or Icon */}
      <div className="mb-6 flex items-center gap-3">
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
        <span className="text-3xl font-extrabold text-primary tracking-tight drop-shadow-md">MentorMatrix</span>
      </div>
      <h1 className="text-7xl font-extrabold text-primary drop-shadow mb-2">404</h1>
      <h2 className="text-2xl md:text-3xl font-bold text-[foreground] mb-3">Page Not Found</h2>
      <p className="text-lg text-[muted-foreground] mb-8 max-w-md">
        Oops! The page you're looking for doesn't exist or has been moved.<br />
        Let's get you back on track with MentorMatrix.
      </p>
      <Link to="/" className="inline-block px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-lg shadow-lg hover:bg-primary/90 transition">
        Go Home
      </Link>
      {/* Decorative SVG */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 opacity-40 pointer-events-none select-none">
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
