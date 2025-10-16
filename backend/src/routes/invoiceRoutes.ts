import { Router } from 'express';
import { InvoiceController } from '../controllers/invoiceController';

export function createInvoiceRoutes(invoiceController: InvoiceController): Router {
  const router = Router();

  router.get('/', invoiceController.getAllInvoices);
  router.get('/:id', invoiceController.getInvoiceById);
  router.get('/:id/pdf', invoiceController.exportInvoicePDF);
  router.post('/', invoiceController.createInvoice);
  router.put('/:id', invoiceController.updateInvoice);
  router.delete('/:id', invoiceController.deleteInvoice);

  return router;
}
