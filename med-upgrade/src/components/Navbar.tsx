import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isStudyView = location.pathname.startsWith('/decks');

  return (
    <nav className="bg-gradient-to-r from-primary to-secondary p-4 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link to="/" className="text-2xl font-bold tracking-tight hover:opacity-90 transition-opacity">
            Med Upgrade
          </Link>

          {/* Navigation Links */}
          {!isStudyView && (
            <div className="flex space-x-6">
              <Link
                to="/"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-black/10 transition-colors"
              >
                General
              </Link>
              <Link
                to="/help"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-black/10 transition-colors"
              >
                Ayuda
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}