import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from '../components';
import { useTranslation } from 'react-i18next';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('home.welcome', 'Welcome to {{app}}', { app: t('common.appName', 'Invoice Manager') })}
        </h1>
        <p className="text-xl text-gray-600">
          {t('home.subtitle', 'Manage your customers and invoices with ease')}
        </p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="text-center">
          <div className="text-5xl mb-4">👥</div>
          <h2 className="text-2xl font-semibold mb-4">{t('navigation.customers')}</h2>
          <p className="text-gray-600 mb-6">
            {t('home.customersDesc', 'Manage your customer database with search and filtering capabilities')}
          </p>
          <Link to="/customers">
            <Button className="w-full">{t('home.viewCustomers', 'View Customers')}</Button>
          </Link>
        </Card>

        <Card className="text-center">
          <div className="text-5xl mb-4">📄</div>
          <h2 className="text-2xl font-semibold mb-4">{t('navigation.invoices')}</h2>
          <p className="text-gray-600 mb-6">
            {t('home.invoicesDesc', 'Create, edit, and track invoices with detailed line items')}
          </p>
          <Link to="/invoices">
            <Button className="w-full">{t('home.viewInvoices', 'View Invoices')}</Button>
          </Link>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <Card className="max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">{t('home.quickActions', 'Quick Actions')}</h3>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/customers">
              <Button variant="secondary">+ {t('customer.newCustomer', 'New Customer')}</Button>
            </Link>
            <Link to="/invoices/new">
              <Button>+ {t('invoice.newInvoice', 'New Invoice')}</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};


