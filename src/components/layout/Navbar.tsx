import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [isDecoyMode, setIsDecoyMode] = useState(false);

  useEffect(() => {
    setIsDecoyMode(sessionStorage.getItem('is_decoy_login') === 'true');
  }, []);
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  const isLandingPage = location.pathname === '/';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="app-container flex justify-between items-center py-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-EncryptEase-400 to-EncryptEase-600 rounded-md p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-white"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <path d="M7 10h10" />
              <path d="M7 14h10" />
            </svg>
          </div>
          <span className="text-xl font-bold text-EncryptEase-700">EncryptEase</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-gray-600 hover:text-EncryptEase-700 transition-colors">
                Dashboard
              </Link>
              <Link to="/applications" className="text-gray-600 hover:text-EncryptEase-700 transition-colors">
                Job Applications
              </Link>
              {isDecoyMode ? (
                <span className="text-gray-400 cursor-not-allowed">AI Tools</span>
              ) : (
                <Link to="/Ai-tools" className="text-gray-600 hover:text-EncryptEase-700 transition-colors">
                  AI Tools
                </Link>
              )}
              <Link to="/vault" className="text-gray-600 hover:text-EncryptEase-700 transition-colors">
                Vault
              </Link>
              <Link
                to="/settings"
                className="text-gray-600 hover:text-EncryptEase-700 transition-colors"
                onClick={(e) => {
                  if (sessionStorage.getItem('decoy_mode') === 'true') {
                    e.preventDefault();
                    window.location.href = '/vault';
                  }
                }}
              >
                Settings
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  sessionStorage.removeItem('isAuthenticated');
                  sessionStorage.removeItem('user');
                  sessionStorage.removeItem('auth_token');
                  sessionStorage.removeItem('decoy_mode');
                  window.location.href = '/';
                }}
              >
                Log Out
              </Button>
            </>
          ) : (
            <>
              {!isLandingPage && (
                <Link to="/" className="text-gray-600 hover:text-EncryptEase-700 transition-colors">
                  Home
                </Link>
              )}
              <Link to="/login" className="text-gray-600 hover:text-EncryptEase-700 transition-colors">
                Login
              </Link>
              <Link to="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-700" onClick={toggleMenu}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white shadow-lg md:hidden animate-fade-in">
            <div className="flex flex-col p-4 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-600 hover:text-EncryptEase-700 py-2"
                    onClick={closeMenu}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/applications"
                    className="text-gray-600 hover:text-EncryptEase-700 py-2"
                    onClick={closeMenu}
                  >
                    Applications
                  </Link>
                  <Link
                    to="/vault"
                    className="text-gray-600 hover:text-EncryptEase-700 py-2"
                    onClick={closeMenu}
                  >
                    Vault
                  </Link>
                  <Link
                    to="/settings"
                    className="text-gray-600 hover:text-EncryptEase-700 py-2"
                    onClick={closeMenu}
                  >
                    Settings
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      sessionStorage.removeItem('isAuthenticated');
                      window.location.href = '/';
                      closeMenu();
                    }}
                  >
                    Log Out
                  </Button>
                </>
              ) : (
                <>
                  {!isLandingPage && (
                    <Link
                      to="/"
                      className="text-gray-600 hover:text-EncryptEase-700 py-2"
                      onClick={closeMenu}
                    >
                      Home
                    </Link>
                  )}
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-EncryptEase-700 py-2"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                  <Link to="/signup" onClick={closeMenu}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
