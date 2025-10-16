import { InvoiceRepository } from '../repositories/invoiceRepository';
import { CustomerRepository } from '../repositories/customerRepository';
import { CreateInvoiceDTO, UpdateInvoiceDTO, QueryFilters, InvoiceWithRelations } from '../types';

export class InvoiceService {
  private invoiceRepository: InvoiceRepository;
  private customerRepository: CustomerRepository;

  constructor(invoiceRepository: InvoiceRepository, customerRepository: CustomerRepository) {
    this.invoiceRepository = invoiceRepository;
    this.customerRepository = customerRepository;
  }

  async getAllInvoices(filters?: QueryFilters): Promise<InvoiceWithRelations[]> {
    return this.invoiceRepository.findAll(filters);
  }

  async getInvoiceById(id: string): Promise<InvoiceWithRelations> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    return invoice;
  }

  async createInvoice(data: CreateInvoiceDTO): Promise<InvoiceWithRelations> {
    // Verify customer exists
    const customer = await this.customerRepository.findById(data.customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Check if invoice number already exists
    const existingInvoice = await this.invoiceRepository.findByNumber(data.number);
    if (existingInvoice) {
      throw new Error('Invoice number already exists');
    }

    // Validate items
    if (!data.items || data.items.length === 0) {
      throw new Error('Invoice must have at least one item');
    }

    // Validate total amount matches sum of items
    const calculatedTotal = data.items.reduce((sum, item) => sum + Number(item.total), 0);
    if (Math.abs(calculatedTotal - Number(data.totalAmount)) > 0.01) {
      throw new Error('Total amount does not match sum of items');
    }

    return this.invoiceRepository.create(data);
  }

  async updateInvoice(id: string, data: UpdateInvoiceDTO): Promise<InvoiceWithRelations> {
    // Check if invoice exists
    await this.getInvoiceById(id);

    // If customerId is being updated, verify new customer exists
    if (data.customerId) {
      const customer = await this.customerRepository.findById(data.customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
    }

    // If invoice number is being updated, check if it already exists
    if (data.number) {
      const existingInvoice = await this.invoiceRepository.findByNumber(data.number);
      if (existingInvoice && existingInvoice.id !== id) {
        throw new Error('Invoice number already exists');
      }
    }

    // Validate items if provided
    if (data.items) {
      if (data.items.length === 0) {
        throw new Error('Invoice must have at least one item');
      }

      // Validate total amount if both items and totalAmount are provided
      if (data.totalAmount !== undefined) {
        const calculatedTotal = data.items.reduce((sum, item) => sum + Number(item.total), 0);
        if (Math.abs(calculatedTotal - Number(data.totalAmount)) > 0.01) {
          throw new Error('Total amount does not match sum of items');
        }
      }
    }

    return this.invoiceRepository.update(id, data);
  }

  async deleteInvoice(id: string): Promise<InvoiceWithRelations> {
    // Check if invoice exists
    await this.getInvoiceById(id);

    return this.invoiceRepository.delete(id);
  }
}
