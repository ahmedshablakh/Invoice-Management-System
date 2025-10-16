import request from 'supertest';
import { app, prisma } from '../src/app';

describe('E2E Test: Create Customer → Create Invoice → Fetch Invoice', () => {
  let customerId: string;
  let invoiceId: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.customer.deleteMany({});
  });

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.$disconnect();
  });

  it('should create a new customer', async () => {
    const customerData = {
      name: 'Test Company Ltd',
      email: 'test@company.com',
      taxNumber: 'TAX-TEST-001',
      address: '123 Test Street, Test City',
    };

    const response = await request(app)
      .post('/api/customers')
      .send(customerData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(customerData.name);
    expect(response.body.email).toBe(customerData.email);
    expect(response.body.taxNumber).toBe(customerData.taxNumber);
    expect(response.body.address).toBe(customerData.address);

    customerId = response.body.id;
  });

  it('should create an invoice for the customer', async () => {
    const invoiceData = {
      customerId,
      number: 'INV-TEST-001',
      date: new Date('2024-01-01').toISOString(),
      dueDate: new Date('2024-02-01').toISOString(),
      status: 'DRAFT',
      totalAmount: 1250.00,
      items: [
        {
          description: 'Consulting Services',
          quantity: 10,
          unitPrice: 100.00,
          total: 1000.00,
        },
        {
          description: 'Software License',
          quantity: 1,
          unitPrice: 250.00,
          total: 250.00,
        },
      ],
    };

    const response = await request(app)
      .post('/api/invoices')
      .send(invoiceData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.number).toBe(invoiceData.number);
    expect(response.body.customerId).toBe(customerId);
    expect(response.body.status).toBe('DRAFT');
    expect(parseFloat(response.body.totalAmount)).toBe(1250.00);
    expect(response.body.items).toHaveLength(2);

    invoiceId = response.body.id;
  });

  it('should fetch the created invoice with customer and items', async () => {
    const response = await request(app)
      .get(`/api/invoices/${invoiceId}`)
      .expect(200);

    expect(response.body.id).toBe(invoiceId);
    expect(response.body.number).toBe('INV-TEST-001');
    expect(response.body.customer).toBeDefined();
    expect(response.body.customer.name).toBe('Test Company Ltd');
    expect(response.body.items).toHaveLength(2);
    expect(response.body.items[0].description).toBe('Consulting Services');
    expect(response.body.items[1].description).toBe('Software License');
  });

  it('should fetch all invoices with filters', async () => {
    const response = await request(app)
      .get('/api/invoices?status=DRAFT')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].status).toBe('DRAFT');
  });

  it('should update the invoice status', async () => {
    const updateData = {
      status: 'SENT',
    };

    const response = await request(app)
      .put(`/api/invoices/${invoiceId}`)
      .send(updateData)
      .expect(200);

    expect(response.body.status).toBe('SENT');
  });

  it('should fetch the customer with their invoices', async () => {
    const response = await request(app)
      .get(`/api/customers/${customerId}`)
      .expect(200);

    expect(response.body.id).toBe(customerId);
    expect(response.body.invoices).toBeDefined();
    expect(response.body.invoices.length).toBeGreaterThan(0);
  });

  it('should search for customers', async () => {
    const response = await request(app)
      .get('/api/customers?search=Test')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].name).toContain('Test');
  });

  it('should handle creating invoice with invalid customer', async () => {
    const invalidInvoiceData = {
      customerId: '00000000-0000-0000-0000-000000000000',
      number: 'INV-INVALID-001',
      date: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      totalAmount: 100.00,
      items: [
        {
          description: 'Test Item',
          quantity: 1,
          unitPrice: 100.00,
          total: 100.00,
        },
      ],
    };

    const response = await request(app)
      .post('/api/invoices')
      .send(invalidInvoiceData)
      .expect(400);

    expect(response.body.error).toContain('not found');
  });

  it('should handle duplicate invoice number', async () => {
    const duplicateInvoiceData = {
      customerId,
      number: 'INV-TEST-001', // Same number as created earlier
      date: new Date().toISOString(),
      dueDate: new Date().toISOString(),
      totalAmount: 100.00,
      items: [
        {
          description: 'Test Item',
          quantity: 1,
          unitPrice: 100.00,
          total: 100.00,
        },
      ],
    };

    const response = await request(app)
      .post('/api/invoices')
      .send(duplicateInvoiceData)
      .expect(400);

    expect(response.body.error).toContain('already exists');
  });
});
