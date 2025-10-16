import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { CustomerRepository } from './repositories/customerRepository';
import { InvoiceRepository } from './repositories/invoiceRepository';
import { UserRepository } from './repositories/userRepository';
import { CustomerService } from './services/customerService';
import { InvoiceService } from './services/invoiceService';
import { AuthService } from './services/authService';
import { PDFService } from './services/pdfService';
import { CustomerController } from './controllers/customerController';
import { InvoiceController } from './controllers/invoiceController';
import { AuthController } from './controllers/authController';
import { createCustomerRoutes } from './routes/customerRoutes';
import { createInvoiceRoutes } from './routes/invoiceRoutes';
import { createAuthRoutes } from './routes/authRoutes';

dotenv.config();

const prisma = new PrismaClient();
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize repositories
const customerRepository = new CustomerRepository(prisma);
const invoiceRepository = new InvoiceRepository(prisma);
const userRepository = new UserRepository(prisma);

// Initialize services
const customerService = new CustomerService(customerRepository);
const invoiceService = new InvoiceService(invoiceRepository, customerRepository);
const authService = new AuthService(userRepository);
const pdfService = new PDFService();

// Initialize controllers
const customerController = new CustomerController(customerService);
const invoiceController = new InvoiceController(invoiceService, pdfService);
const authController = new AuthController(authService);

// Routes
app.use('/api/auth', createAuthRoutes(authController));
app.use('/api/customers', createCustomerRoutes(customerController));
app.use('/api/invoices', createInvoiceRoutes(invoiceController));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

export { app, prisma };
