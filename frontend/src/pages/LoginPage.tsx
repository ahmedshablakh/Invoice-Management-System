import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Toast } from '../components/Toast';
import { useTranslation } from 'react-i18next';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setToast(null);

    try {
      await login(email, password);
  setToast({ message: t('messages.loginSuccess', 'Login successful!'), type: 'success' });
      setTimeout(() => navigate('/'), 1000);
    } catch (error: any) {
  setToast({ message: error.message || t('messages.loginFailed', 'Login failed'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* MODIFIED: Added animation classes for a subtle fade-in effect */}
      <div className="max-w-md w-full transition-all duration-500 ease-in-out transform animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{t('common.appName', 'Invoice Manager')}</h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">{t('auth.loginTitle', 'Sign in to your account')}</h2>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={t('common.email', 'Email address')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.emailPlaceholder', 'you@example.com')}
              required
              autoComplete="email"
            />

            <Input
              label={t('common.password', 'Password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder', '••••••••')}
              required
              autoComplete="current-password"
            />

            <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
              {isLoading ? t('auth.signingIn', 'Signing in...') : t('auth.signIn', 'Sign in')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.noAccount', "Don't have an account?")}{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                {t('auth.signUp', 'Sign up')}
              </Link>
            </p>
          </div>
        </Card>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};