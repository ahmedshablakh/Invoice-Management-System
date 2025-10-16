// Invoice status enum
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface CreateCustomerDTO {
  name: string;
  email: string;
  taxNumber?: string;
  address?: string;
}

export interface UpdateCustomerDTO {
  name?: string;
  email?: string;
  taxNumber?: string;
  address?: string;
}

export interface CreateInvoiceItemDTO {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateInvoiceDTO {
  customerId: string;
  number: string;
  date: Date | string;
  dueDate: Date | string;
  status?: InvoiceStatus;
  totalAmount: number;
  items: CreateInvoiceItemDTO[];
}

export interface UpdateInvoiceDTO {
  customerId?: string;
  number?: string;
  date?: Date | string;
  dueDate?: Date | string;
  status?: InvoiceStatus;
  totalAmount?: number;
  items?: CreateInvoiceItemDTO[];
}

export interface QueryFilters {
  search?: string;
  status?: InvoiceStatus;
  customerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Entity types
export interface Customer {
  id: string;
  name: string;
  email: string;
  taxNumber?: string | null;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  customerId: string;
  number: string;
  date: Date;
  dueDate: Date;
  status: InvoiceStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  customer: Customer;
  items: InvoiceItem[];
}

export type InvoiceFilters = QueryFilters;
