import { Decimal } from '@prisma/client/runtime/library';
import { Invoice as PrismaInvoice, Customer as PrismaCustomer, InvoiceItem as PrismaInvoiceItem } from '@prisma/client';

// Enums
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

// Extended types with relations
export type InvoiceWithRelations = PrismaInvoice & {
  customer: PrismaCustomer;
  items: PrismaInvoiceItem[];
};

export type Invoice = InvoiceWithRelations;
export type Customer = PrismaCustomer;
export type InvoiceItem = PrismaInvoiceItem;

// Customer DTOs
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

// Invoice Item
export interface InvoiceItemDTO {
  description: string;
  quantity: number;
  unitPrice: number | Decimal;
  total: number | Decimal;
}

// Invoice DTOs
export interface CreateInvoiceDTO {
  customerId: string;
  number: string;
  date: string;
  dueDate: string;
  status: InvoiceStatus | string;
  totalAmount: number | Decimal;
  items: InvoiceItemDTO[];
}

export interface UpdateInvoiceDTO {
  customerId?: string;
  number?: string;
  date?: string;
  dueDate?: string;
  status?: InvoiceStatus | string;
  totalAmount?: number | Decimal;
  items?: InvoiceItemDTO[];
}

// Query Filters
export interface QueryFilters {
  search?: string;
  status?: InvoiceStatus | string;
  customerId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
