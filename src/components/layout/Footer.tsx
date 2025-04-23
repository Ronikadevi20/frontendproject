
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="app-container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
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
            <p className="mt-4 text-sm text-gray-500 max-w-xs">
              Securely organize your job applications and manage passwords for your job hunting journey.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">© {currentYear} EncryptEase. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
