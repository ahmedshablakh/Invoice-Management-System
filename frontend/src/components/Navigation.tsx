import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false); // State to control the mobile menu

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Classes for desktop links
  const linkClasses = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-blue-700 text-white'
        : 'text-white hover:bg-blue-500 hover:text-white'
    }`;
  
  // Classes for mobile links
  const mobileLinkClasses = (path: string) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive(path)
        ? 'bg-blue-700 text-white'
        : 'text-gray-300 hover:bg-blue-500 hover:text-white'
    }`;


  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false); // Close menu on logout
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Desktop Links */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <span className="text-white text-xl font-bold">Invoice Manager</span>
            </Link>
            {/* Desktop Navigation Links - Hidden on small screens */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/customers" className={linkClasses('/customers')}>
                  {t('navigation.customers')}
                </Link>
                <Link to="/invoices" className={linkClasses('/invoices')}>
                  {t('navigation.invoices')}
                </Link>
              </div>
            </div>
          </div>

          {/* User Info and Logout Button for Desktop - Hidden on small screens */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            {user && (
              <>
                <span className="text-white text-sm">
                  {t('common.welcome', 'Welcome')}, <span className="font-semibold">{user.name}</span>
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="!text-blue-600 !bg-white hover:!bg-blue-100"
                >
                  {t('common.logout')}
                </Button>
              </>
            )}
          </div>

          {/* Hamburger Menu Button - Shown on small screens */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-blue-600 inline-flex items-center justify-center p-2 rounded-md text-blue-200 hover:text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">{isOpen ? t('common.closeMenu', 'Close menu') : t('common.openMenu', 'Open menu')}</span>
              {/* Icon for menu (hamburger) or close (X) */}
              {!isOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - Conditionally rendered */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/customers" className={mobileLinkClasses('/customers')} onClick={() => setIsOpen(false)}>
              {t('navigation.customers')}
            </Link>
            <Link to="/invoices" className={mobileLinkClasses('/invoices')} onClick={() => setIsOpen(false)}>
              {t('navigation.invoices')}
            </Link>
          </div>
          {/* User Info and Logout for Mobile */}
          {user && (
            <div className="pt-1 pb-3 border-t border-blue-700">
              
              <div className="mt-1 px-1 space-y-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-blue-500"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};