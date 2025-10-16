import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerAPI } from '../services/api';
import { Customer, CreateCustomerDTO } from '../types';
import { Button, Input, Card, Loading, Toast, Modal } from '../components';

export const CustomerListPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<CreateCustomerDTO>({
    name: '',
    email: '',
    taxNumber: '',
    address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (search?: string) => {
    try {
      setLoading(true);
      const data = await customerAPI.getAll(search);
      setCustomers(data);
    } catch (error) {
      setToast({ message: 'Failed to fetch customers', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(searchTerm);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await customerAPI.create(formData);
      setToast({ message: 'Customer created successfully!', type: 'success' });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', taxNumber: '', address: '' });
      setErrors({});
      fetchCustomers(searchTerm);
    } catch (error: any) {
      setToast({
        message: error.response?.data?.error || 'Failed to create customer',
        type: 'error',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;

    try {
      await customerAPI.delete(id);
      setToast({ message: 'Customer deleted successfully!', type: 'success' });
      fetchCustomers(searchTerm);
    } catch (error) {
      setToast({ message: 'Failed to delete customer', type: 'error' });
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

      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            + New Customer
          </Button>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            placeholder="Search by name, email, or tax number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
          {searchTerm && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSearchTerm('');
                fetchCustomers();
              }}
            >
              Clear
            </Button>
          )}
        </form>
      </div>

      {customers.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            No customers found. Create your first customer to get started!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customers.map((customer) => (
            <Card key={customer.id}>
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  {customer.name}
                </h3>
                <div className="flex gap-2">
                  <Link to={`/customers/${customer.id}`}>
                    <Button size="sm" variant="secondary">
                      View
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(customer.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>📧 {customer.email}</p>
                {customer.taxNumber && <p>🏢 {customer.taxNumber}</p>}
                {customer.address && <p>📍 {customer.address}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setErrors({});
        }}
        title="Create New Customer"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
          />
          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />
          <Input
            label="Tax Number"
            value={formData.taxNumber}
            onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
          />
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Create Customer
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setErrors({});
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
