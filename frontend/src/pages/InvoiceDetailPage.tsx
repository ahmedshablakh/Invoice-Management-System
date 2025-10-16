import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { invoiceAPI } from '../services/api';
import { Invoice } from '../types';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Loading } from '../components/Loading';
import { Toast } from '../components/Toast';
import { formatCurrency, formatDate, getStatusColor } from '../utils/helpers';

export const InvoiceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (id) {
      fetchInvoice(id);
    }
  }, [id]);

  const fetchInvoice = async (invoiceId: string) => {
    try {
      setLoading(true);
      const data = await invoiceAPI.getById(invoiceId);
      setInvoice(data);
    } catch (error) {
      setToast({ message: 'Failed to fetch invoice', type: 'error' });
      setTimeout(() => navigate('/invoices'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this invoice?')) return;

    try {
      await invoiceAPI.delete(id);
      setToast({ message: 'Invoice deleted successfully!', type: 'success' });
      setTimeout(() => navigate('/invoices'), 1000);
    } catch (error) {
      setToast({ message: 'Failed to delete invoice', type: 'error' });
    }
  };

  const handleDownloadPDF = async () => {
    if (!id) return;

    try {
      setIsDownloadingPDF(true);
      const blob = await invoiceAPI.exportPDF(id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice?.number || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setToast({ message: 'PDF downloaded successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to download PDF', type: 'error' });
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  if (loading) return <Loading />;
  if (!invoice) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-6 flex justify-between items-center">
        <Button variant="secondary" onClick={() => navigate('/invoices')}>
          ← Back to Invoices
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="success" 
            onClick={handleDownloadPDF}
            isLoading={isDownloadingPDF}
          >
            📄 {isDownloadingPDF ? 'Generating PDF...' : 'Download PDF'}
          </Button>
          <Link to={`/invoices/${id}/edit`}>
            <Button variant="secondary">Edit</Button>
          </Link>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Invoice {invoice.number}
            </h1>
            <span
              className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusColor(
                invoice.status
              )}`}
            >
              {invoice.status}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(Number(invoice.totalAmount))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h3>
            <div className="space-y-1">
              <p className="text-lg font-semibold text-gray-900">
                {invoice.customer?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">{invoice.customer?.email}</p>
              {invoice.customer?.taxNumber && (
                <p className="text-sm text-gray-600">Tax #: {invoice.customer.taxNumber}</p>
              )}
              {invoice.customer?.address && (
                <p className="text-sm text-gray-600">{invoice.customer.address}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Invoice Details</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Invoice Date:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(invoice.date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Due Date:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(invoice.dueDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Created:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(invoice.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Line Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {formatCurrency(Number(item.unitPrice))}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(Number(item.total))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={3} className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  Total Amount:
                </td>
                <td className="px-6 py-4 text-right text-lg font-bold text-gray-900">
                  {formatCurrency(Number(invoice.totalAmount))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
};
