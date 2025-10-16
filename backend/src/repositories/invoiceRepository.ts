import { PrismaClient, InvoiceStatus } from '@prisma/client';
import { CreateInvoiceDTO, UpdateInvoiceDTO, QueryFilters, InvoiceWithRelations } from '../types';

export class InvoiceRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(filters?: QueryFilters): Promise<InvoiceWithRelations[]> {
    const where: any = {};

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { number: { contains: filters.search, mode: 'insensitive' as const } },
        { customer: { name: { contains: filters.search, mode: 'insensitive' as const } } },
      ];
    }

    const orderBy: any = {};
    if (filters?.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    return this.prisma.invoice.findMany({
      where,
      include: {
        customer: true,
        items: true,
      },
      orderBy,
    });
  }

  async findById(id: string): Promise<InvoiceWithRelations | null> {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async create(data: CreateInvoiceDTO): Promise<InvoiceWithRelations> {
    const { items, ...invoiceData } = data;

    return this.prisma.invoice.create({
      data: {
        customerId: invoiceData.customerId,
        number: invoiceData.number,
        date: new Date(invoiceData.date),
        dueDate: new Date(invoiceData.dueDate),
        status: invoiceData.status as InvoiceStatus,
        totalAmount: invoiceData.totalAmount,
        items: {
          create: items,
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async update(id: string, data: UpdateInvoiceDTO): Promise<InvoiceWithRelations> {
    const { items, ...invoiceData } = data;

    // If items are provided, delete old items and create new ones
    if (items) {
      await this.prisma.invoiceItem.deleteMany({
        where: { invoiceId: id },
      });
    }

    const updateData: any = {};
    
    if (invoiceData.customerId) updateData.customerId = invoiceData.customerId;
    if (invoiceData.number) updateData.number = invoiceData.number;
    if (invoiceData.date) updateData.date = new Date(invoiceData.date);
    if (invoiceData.dueDate) updateData.dueDate = new Date(invoiceData.dueDate);
    if (invoiceData.status) updateData.status = invoiceData.status as InvoiceStatus;
    if (invoiceData.totalAmount !== undefined) updateData.totalAmount = invoiceData.totalAmount;
    
    if (items) {
      updateData.items = {
        create: items,
      };
    }

    return this.prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async delete(id: string): Promise<InvoiceWithRelations> {
    return this.prisma.invoice.delete({
      where: { id },
      include: {
        customer: true,
        items: true,
      },
    });
  }

  async findByNumber(number: string): Promise<InvoiceWithRelations | null> {
    return this.prisma.invoice.findUnique({
      where: { number },
      include: {
        customer: true,
        items: true,
      },
    });
  }
}
