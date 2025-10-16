import { Request, Response } from 'express';
import { InvoiceService } from '../services/invoiceService';
import { PDFService } from '../services/pdfService';
import { QueryFilters } from '../types';

export class InvoiceController {
  private invoiceService: InvoiceService;
  private pdfService: PDFService;

  constructor(invoiceService: InvoiceService, pdfService: PDFService) {
    this.invoiceService = invoiceService;
    this.pdfService = pdfService;
  }

  getAllInvoices = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: QueryFilters = {
        search: req.query.search as string,
        status: req.query.status as any,
        customerId: req.query.customerId as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };

      const invoices = await this.invoiceService.getAllInvoices(filters);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch invoices' });
    }
  };

  getInvoiceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const invoice = await this.invoiceService.getInvoiceById(id);
      res.json(invoice);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invoice not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch invoice' });
      }
    }
  };

  createInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const invoice = await this.invoiceService.createInvoice(req.body);
      res.status(201).json(invoice);
    } catch (error) {
      console.error('Create invoice error:', error);
      if (error instanceof Error) {
        if (
          error.message.includes('not found') ||
          error.message.includes('already exists') ||
          error.message.includes('must have') ||
          error.message.includes('does not match')
        ) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Failed to create invoice', details: error.message });
        }
      } else {
        res.status(500).json({ error: 'Failed to create invoice' });
      }
    }
  };

  updateInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const invoice = await this.invoiceService.updateInvoice(id, req.body);
      res.json(invoice);
    } catch (error) {
      console.error('Update invoice error:', error);
      if (error instanceof Error) {
        if (error.message === 'Invoice not found' || error.message === 'Customer not found') {
          res.status(404).json({ error: error.message });
        } else if (
          error.message.includes('already exists') ||
          error.message.includes('must have') ||
          error.message.includes('does not match')
        ) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Failed to update invoice', details: error.message });
        }
      } else {
        res.status(500).json({ error: 'Failed to update invoice' });
      }
    }
  };

  deleteInvoice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.invoiceService.deleteInvoice(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Invoice not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete invoice' });
      }
    }
  };

  exportInvoicePDF = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const invoice = await this.invoiceService.getInvoiceById(id);

      // Prepare data for PDF
      const pdfData = {
        invoice: {
          id: invoice.id,
          number: invoice.number,
          date: invoice.date,
          dueDate: invoice.dueDate,
          status: invoice.status,
          totalAmount: Number(invoice.totalAmount),
        },
        customer: {
          name: invoice.customer.name,
          email: invoice.customer.email,
          taxNumber: invoice.customer.taxNumber || undefined,
          address: invoice.customer.address || undefined,
        },
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
        })),
      };

      // Generate PDF
      const pdfBuffer = await this.pdfService.generateInvoicePDF(pdfData);

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.number}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Send PDF
      res.send(pdfBuffer);
    } catch (error) {
      console.error('PDF export error:', error);
      if (error instanceof Error && error.message === 'Invoice not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to export invoice PDF' });
      }
    }
  };
}
