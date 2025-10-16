import { PrismaClient, Customer } from '@prisma/client';
import { CreateCustomerDTO, UpdateCustomerDTO } from '../types';

export class CustomerRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async findAll(search?: string): Promise<Customer[]> {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { taxNumber: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return this.prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { id },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async create(data: CreateCustomerDTO): Promise<Customer> {
    return this.prisma.customer.create({
      data,
    });
  }

  async update(id: string, data: UpdateCustomerDTO): Promise<Customer> {
    return this.prisma.customer.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Customer> {
    return this.prisma.customer.delete({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return this.prisma.customer.findUnique({
      where: { email },
    });
  }
}
