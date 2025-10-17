import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { invoiceAPI } from '../services/api';
import { Invoice, InvoiceFilters } from '../types';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';
import { Toast } from '../components/Toast';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';

// Responsive InvoiceListPage
// - Filters stack on small screens and form a grid on md+
// - Table replaced with responsive list cards on xs/sm for better readability
// - Actions become touch-friendly buttons, stacked on very small screens

export const InvoiceListPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingPDFs, setDownloadingPDFs] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [filters, setFilters] = useState<InvoiceFilters>({
    search: '',
    status: undefined,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInvoices = async (customFilters?: InvoiceFilters) => {
    try {
      setLoading(true);
      const filtersToUse = customFilters || filters;
      const cleanFilters = Object.fromEntries(
        Object.entries(filtersToUse).filter(([, value]) => value !== '' && value !== undefined)
      );
      const data = await invoiceAPI.getAll(cleanFilters);
      setInvoices(data);
    } catch (error) {
      setToast({ message: 'Failed to fetch invoices', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof InvoiceFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchInvoices(newFilters);
  };

  const handleClearFilters = () => {
    const defaultFilters: InvoiceFilters = {
      search: '',
      status: undefined,
      sortBy: 'date',
      sortOrder: 'desc',
    };
    setFilters(defaultFilters);
    fetchInvoices(defaultFilters);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await invoiceAPI.delete(id);
      setToast({ message: 'Invoice deleted successfully!', type: 'success' });
      fetchInvoices(filters);
    } catch (error) {
      setToast({ message: 'Failed to delete invoice', type: 'error' });
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      setDownloadingPDFs(prev => new Set(prev).add(invoice.id));
      const blob = await invoiceAPI.exportPDF(invoice.id);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setToast({ message: 'PDF downloaded successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to download PDF', type: 'error' });
    } finally {
      setDownloadingPDFs(prev => {
        const newSet = new Set(prev);
        newSet.delete(invoice.id);
        return newSet;
      });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Invoices</h1>
          <Link to="/invoices/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">+ New Invoice</Button>
          </Link>
        </div>

        <Card>
          {/* Filters: responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <Input
              placeholder="Search by customer, number..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full"
            />

            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'SENT', label: 'Sent' },
                { value: 'PAID', label: 'Paid' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
            />

            <Select
              options={[
                { value: 'date', label: 'Sort by Date' },
                { value: 'dueDate', label: 'Sort by Due Date' },
                { value: 'totalAmount', label: 'Sort by Amount' },
                { value: 'number', label: 'Sort by Number' },
              ]}
              value={filters.sortBy || 'date'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            />

            <Select
              options={[
                { value: 'desc', label: 'Descending' },
                { value: 'asc', label: 'Ascending' },
              ]}
              value={filters.sortOrder || 'desc'}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            />
          </div>

          <div className="mt-4 flex justify-start">
            <Button variant="secondary" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        </Card>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No invoices found. Create your first invoice to get started!</p>
        </Card>
      ) : (
        <>
          {/* Desktop/table view */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.customer?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(invoice.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(invoice.dueDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(Number(invoice.totalAmount))}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="success" onClick={() => handleDownloadPDF(invoice)} isLoading={downloadingPDFs.has(invoice.id)}>PDF</Button>
                      
                      <Button size="sm" variant="danger" onClick={() => handleDelete(invoice.id)}>Delete</Button>
                      <Link to={`/invoices/${invoice.id}`}><Button size="sm" variant="secondary">View</Button></Link>
                      <Link to={`/invoices/${invoice.id}/edit`}><Button size="sm" variant="secondary">Edit</Button></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet card list */}
          <div className="lg:hidden space-y-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">#{invoice.number} • {invoice.customer?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{formatDate(invoice.date)} • Due {formatDate(invoice.dueDate)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(Number(invoice.totalAmount))}</p>
                        <span className={`mt-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>{invoice.status}</span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                       <Link to={`/invoices/${invoice.id}`}><Button size="sm" variant="secondary">View</Button></Link>
                      <Link to={`/invoices/${invoice.id}/edit`}><Button size="sm" variant="secondary">Edit</Button></Link>
                      <Button size="sm" variant="success" onClick={() => handleDownloadPDF(invoice)} isLoading={downloadingPDFs.has(invoice.id)}>PDF</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(invoice.id)}>Delete</Button>
                     
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default InvoiceListPage;
