import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isStudyView = location.pathname.startsWith('/decks');

  return (
    <nav className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Med Upgrade
        </Link>
        
        {!isStudyView && (
          <div className="space-x-4">
            <Link to="/" className="hover:opacity-80">
              General
            </Link>
            <Link to="/help" className="hover:opacity-80">
              Ayuda
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}