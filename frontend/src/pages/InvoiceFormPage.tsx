import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { customerAPI, invoiceAPI } from '../services/api';
import { Customer, CreateInvoiceDTO, InvoiceItem, InvoiceStatus } from '../types';
import { Button, Input, Select, Card, Loading, Toast } from '../components';
import {
  calculateItemTotal,
  calculateInvoiceTotal,
  generateInvoiceNumber,
} from '../utils/helpers';

export const InvoiceFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<CreateInvoiceDTO>({
    customerId: '',
    number: generateInvoiceNumber(),
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'DRAFT',
    totalAmount: 0,
    items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCustomers();
    if (isEditMode && id) {
      fetchInvoice(id);
    }
  }, [id, isEditMode]);

  const fetchCustomers = async () => {
    try {
      const data = await customerAPI.getAll();
      setCustomers(data);
    } catch (error) {
      setToast({ message: 'Failed to fetch customers', type: 'error' });
    }
  };

  const fetchInvoice = async (invoiceId: string) => {
    try {
      setLoading(true);
      const invoice = await invoiceAPI.getById(invoiceId);
      setFormData({
        customerId: invoice.customerId,
        number: invoice.number,
        date: invoice.date.split('T')[0],
        dueDate: invoice.dueDate.split('T')[0],
        status: invoice.status,
        totalAmount: Number(invoice.totalAmount),
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
        })),
      });
    } catch (error) {
      setToast({ message: 'Failed to fetch invoice', type: 'error' });
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? Number(value) : newItems[index].quantity;
      const unitPrice = field === 'unitPrice' ? Number(value) : newItems[index].unitPrice;
      newItems[index].total = calculateItemTotal(quantity, unitPrice);
    }

    const totalAmount = calculateInvoiceTotal(newItems);
    setFormData({ ...formData, items: newItems, totalAmount });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }],
    });
  };

  const removeItem = (index: number) => {
    if (formData.items.length === 1) {
      setToast({ message: 'Invoice must have at least one item', type: 'error' });
      return;
    }

    const newItems = formData.items.filter((_, i) => i !== index);
    const totalAmount = calculateInvoiceTotal(newItems);
    setFormData({ ...formData, items: newItems, totalAmount });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerId) {
      newErrors.customerId = 'Customer is required';
    }

    if (!formData.number.trim()) {
      newErrors.number = 'Invoice number is required';
    }

    if (!formData.date) {
      newErrors.date = 'Invoice date is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    formData.items.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`item_${index}_description`] = 'Description is required';
      }
      if (item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Quantity must be greater than 0';
      }
      if (item.unitPrice <= 0) {
        newErrors[`item_${index}_unitPrice`] = 'Unit price must be greater than 0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setToast({ message: 'Please fix the errors in the form', type: 'error' });
      return;
    }

    try {
      if (isEditMode && id) {
        await invoiceAPI.update(id, formData);
        setToast({ message: 'Invoice updated successfully!', type: 'success' });
      } else {
        await invoiceAPI.create(formData);
        setToast({ message: 'Invoice created successfully!', type: 'success' });
      }
      setTimeout(() => navigate('/invoices'), 1000);
    } catch (error: any) {
      setToast({
        message: error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} invoice`,
        type: 'error',
      });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Customer *"
              options={[
                { value: '', label: 'Select a customer' },
                ...customers.map((c) => ({ value: c.id, label: c.name })),
              ]}
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              error={errors.customerId}
            />
            <Input
              label="Invoice Number *"
              value={formData.number}
              onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              error={errors.number}
            />
            <Input
              label="Invoice Date *"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              error={errors.date}
            />
            <Input
              label="Due Date *"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              error={errors.dueDate}
            />
            <Select
              label="Status"
              options={[
                { value: 'DRAFT', label: 'Draft' },
                { value: 'SENT', label: 'Sent' },
                { value: 'PAID', label: 'Paid' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value as InvoiceStatus })
              }
            />
          </div>
        </Card>

        <Card className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Line Items</h2>
            <Button type="button" size="sm" onClick={addItem}>
              + Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5">
                    <Input
                      label="Description *"
                      value={item.description}
                      onChange={(e) =>
                        handleItemChange(index, 'description', e.target.value)
                      }
                      error={errors[`item_${index}_description`]}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Quantity *"
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, 'quantity', Number(e.target.value))
                      }
                      error={errors[`item_${index}_quantity`]}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Input
                      label="Unit Price *"
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleItemChange(index, 'unitPrice', Number(e.target.value))
                      }
                      error={errors[`item_${index}_unitPrice`]}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total
                    </label>
                    <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100">
                      ${item.total.toFixed(2)}
                    </div>
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="w-full"
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Amount</div>
              <div className="text-2xl font-bold text-gray-900">
                ${formData.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            {isEditMode ? 'Update Invoice' : 'Create Invoice'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/invoices')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
