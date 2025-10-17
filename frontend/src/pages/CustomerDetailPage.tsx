import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { customerAPI, invoiceAPI } from '../services/api';
import { Customer, Invoice } from '../types';
import { Button, Card, Loading, Toast } from '../components';
import { useTranslation } from 'react-i18next';

// Responsive CustomerDetailPage
// - Layout stacks on small screens, becomes two-column on md+
// - Invoice list: table on lg+, card list on smaller screens
// - Buttons and actions are touch-friendly and full-width on xs

export const CustomerDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (id) {
      fetchCustomer(id);
      fetchCustomerInvoices(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCustomer = async (customerId: string) => {
    try {
      const data = await customerAPI.getById(customerId);
      setCustomer(data);
    } catch (error) {
  setToast({ message: t('messages.fetchCustomerFailed', 'Failed to fetch customer details'), type: 'error' });
      setTimeout(() => navigate('/customers'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerInvoices = async (customerId: string) => {
    try {
      const data = await invoiceAPI.getAll({ customerId });
      setInvoices(data);
    } catch (error) {
      console.error('Failed to fetch customer invoices:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateInput: string | Date) => {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SENT: 'bg-blue-100 text-blue-800',
      PAID: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const calculateTotalAmount = () => {
    return invoices.reduce((sum, invoice) => sum + Number(invoice.totalAmount), 0);
  };

  const handleDelete = async () => {
    if (!id || !customer) return;

    const confirmed = window.confirm(
      t('messages.confirmDeleteCustomerWithName', 'Are you sure you want to delete {{name}}? This will also delete all associated invoices.', { name: customer.name })
    );

    if (!confirmed) return;

    try {
      await customerAPI.delete(id);
  setToast({ message: t('messages.customerDeleted', 'Customer deleted successfully!'), type: 'success' });
      setTimeout(() => navigate('/customers'), 1000);
    } catch (error: any) {
      setToast({
        message: error.response?.data?.error || t('messages.deleteCustomerFailed', 'Failed to delete customer'),
        type: 'error',
      });
    }
  };

  if (loading) return <Loading />;

  if (!customer) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <p className="text-center text-gray-500">Customer not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full">
          <button
            onClick={() => navigate('/customers')}
            className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
          >
            ← Back to Customers
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">{customer.name}</h1>
        </div>

        <div className="w-full sm:w-auto flex gap-3 flex-col sm:flex-row">
          <Link to={`/invoices/new`} state={{ customerId: customer.id }} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">+ New Invoice</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete} className="w-full sm:w-auto">Delete Customer</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left / main: Customer info and summary */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900 break-words">{customer.email}</p>
              </div>
              {customer.taxNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tax Number</label>
                  <p className="text-gray-900 break-words">{customer.taxNumber}</p>
                </div>
              )}
              {customer.address && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <p className="text-gray-900 break-words">{customer.address}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-gray-900">{formatDate(customer.createdAt)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <p className="text-gray-900">{formatDate(customer.updatedAt)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoices</h2>

            {invoices.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No invoices found for this customer.</p>
            ) : (
              <>
                {/* Table for large screens */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(invoice.date)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(invoice.dueDate)}</td>
                          <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>{invoice.status}</span></td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(Number(invoice.totalAmount))}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <Link to={`/invoices/${invoice.id}`}><Button size="sm" variant="secondary">View</Button></Link>
                              <Link to={`/invoices/${invoice.id}/edit`}><Button size="sm" variant="secondary">Edit</Button></Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Card list for mobile/tablet */}
                <div className="lg:hidden space-y-4">
                  {invoices.map((invoice) => (
                    <Card key={invoice.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">#{invoice.number}</p>
                          <p className="text-xs text-gray-500">{formatDate(invoice.date)} • Due {formatDate(invoice.dueDate)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{formatCurrency(Number(invoice.totalAmount))}</p>
                          <span className={`mt-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>{invoice.status}</span>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Link to={`/invoices/${invoice.id}`}><Button size="sm" className="w-full">View</Button></Link>
                        <Link to={`/invoices/${invoice.id}/edit`}><Button size="sm" className="w-full">Edit</Button></Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Right: Summary widgets */}
        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Invoice Summary</h2>
            <div className="grid grid-cols-1 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Total Invoices</p>
                <p className="text-xl font-bold text-gray-900">{invoices.length}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Paid Invoices</p>
                <p className="text-xl font-bold text-green-700">{invoices.filter((inv) => inv.status === 'PAID').length}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(calculateTotalAmount())}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
