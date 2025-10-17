import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { Toast } from '../components/Toast';
import { useTranslation } from 'react-i18next';

export const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  // MODIFIED: Added state for inline form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear the error for the field being edited
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  // MODIFIED: Enhanced validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.password.length < 6) {
      newErrors.password = t('auth.passwordMinLength', 'Password must be at least 6 characters long');
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordsNotMatch', 'Passwords do not match');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setToast(null);

    // Run validation first
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      await register(formData.email, formData.password, formData.name);
  setToast({ message: t('messages.registrationSuccess', 'Registration successful! Redirecting...'), type: 'success' });
      setTimeout(() => navigate('/'), 1500);
    } catch (error: any) {
  setToast({ message: error.message || t('messages.registrationFailed', 'Registration failed'), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* MODIFIED: Added animation classes */}
      <div className="max-w-md w-full transition-all duration-500 ease-in-out transform animate-fadeIn">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{t('common.appName', 'Invoice Manager')}</h1>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">{t('auth.registerTitle', 'Create your account')}</h2>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={t('auth.fullName', 'Full Name')}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('auth.namePlaceholder', 'John Doe')}
              required
              autoComplete="name"
            />

            <Input
              label={t('common.email', 'Email address')}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('auth.emailPlaceholder', 'you@example.com')}
              required
              autoComplete="email"
            />

            <Input
              label={t('common.password', 'Password')}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('auth.passwordPlaceholder', '••••••••')}
              required
              autoComplete="new-password"
              // MODIFIED: Displaying inline error
              error={errors.password}
            />

            <Input
              label={t('auth.confirmPassword', 'Confirm Password')}
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder={t('auth.passwordPlaceholder', '••••••••')}
              required
              autoComplete="new-password"
              // MODIFIED: Displaying inline error
              error={errors.confirmPassword}
            />

            <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
              {isLoading ? t('auth.creatingAccount', 'Creating account...') : t('auth.signUp', 'Sign up')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.hasAccount', 'Already have an account?')}{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                {t('auth.signIn', 'Sign in')}
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