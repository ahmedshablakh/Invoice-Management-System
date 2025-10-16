import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const linkClasses = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-blue-700 text-white'
        : 'text-white hover:bg-blue-500'
    }`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-white text-xl font-bold">Invoice Manager</span>
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/customers" className={linkClasses('/customers')}>
                Customers
              </Link>
              <Link to="/invoices" className={linkClasses('/invoices')}>
                Invoices
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-white text-sm">
                  Welcome, <span className="font-semibold">{user.name}</span>
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="!text-gray-700 hover:!bg-gray-100"
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
