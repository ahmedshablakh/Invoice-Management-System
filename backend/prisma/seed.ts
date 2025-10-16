import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';


const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // Create sample user for authentication
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
    },
  });

  console.log('Created admin user:', { email: adminUser.email, name: adminUser.name });

  // Create customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Acme Corporation',
      email: 'contact@acme.com',
      taxNumber: 'TAX-001-ACME',
      address: '123 Business St, New York, NY 10001',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Tech Solutions Inc',
      email: 'info@techsolutions.com',
      taxNumber: 'TAX-002-TECH',
      address: '456 Innovation Ave, San Francisco, CA 94105',
    },
  });

  const customer3 = await prisma.customer.create({
    data: {
      name: 'Global Traders LLC',
      email: 'admin@globaltraders.com',
      taxNumber: 'TAX-003-GLOBAL',
      address: '789 Commerce Blvd, Chicago, IL 60601',
    },
  });

  console.log('Created customers:', { customer1, customer2, customer3 });

  // Create invoices with items
  const invoice1 = await prisma.invoice.create({
    data: {
      customerId: customer1.id,
      number: 'INV-2024-001',
      date: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
      status: 'PAID',
      totalAmount: 1500.00,
      items: {
        create: [
          {
            description: 'Web Development Services',
            quantity: 40,
            unitPrice: 25.00,
            total: 1000.00,
          },
          {
            description: 'Hosting & Maintenance',
            quantity: 1,
            unitPrice: 500.00,
            total: 500.00,
          },
        ],
      },
    },
    include: { items: true },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      customerId: customer2.id,
      number: 'INV-2024-002',
      date: new Date('2024-02-01'),
      dueDate: new Date('2024-03-01'),
      status: 'SENT',
      totalAmount: 3200.00,
      items: {
        create: [
          {
            description: 'Software License - Enterprise',
            quantity: 10,
            unitPrice: 200.00,
            total: 2000.00,
          },
          {
            description: 'Technical Support - Annual',
            quantity: 1,
            unitPrice: 1200.00,
            total: 1200.00,
          },
        ],
      },
    },
    include: { items: true },
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      customerId: customer1.id,
      number: 'INV-2024-003',
      date: new Date('2024-02-10'),
      dueDate: new Date('2024-03-10'),
      status: 'DRAFT',
      totalAmount: 850.00,
      items: {
        create: [
          {
            description: 'UI/UX Design Consultation',
            quantity: 10,
            unitPrice: 75.00,
            total: 750.00,
          },
          {
            description: 'Design Assets Package',
            quantity: 1,
            unitPrice: 100.00,
            total: 100.00,
          },
        ],
      },
    },
    include: { items: true },
  });

  const invoice4 = await prisma.invoice.create({
    data: {
      customerId: customer3.id,
      number: 'INV-2024-004',
      date: new Date('2024-02-15'),
      dueDate: new Date('2024-03-15'),
      status: 'SENT',
      totalAmount: 2400.00,
      items: {
        create: [
          {
            description: 'Database Migration Service',
            quantity: 24,
            unitPrice: 100.00,
            total: 2400.00,
          },
        ],
      },
    },
    include: { items: true },
  });

  console.log('Created invoices:', { invoice1, invoice2, invoice3, invoice4 });
  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
