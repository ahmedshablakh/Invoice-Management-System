import { Customer } from '@prisma/client';
import { CustomerRepository } from '../repositories/customerRepository';
import { CreateCustomerDTO, UpdateCustomerDTO } from '../types';

export class CustomerService {
  private customerRepository: CustomerRepository;

  constructor(customerRepository: CustomerRepository) {
    this.customerRepository = customerRepository;
  }

  async getAllCustomers(search?: string): Promise<Customer[]> {
    return this.customerRepository.findAll(search);
  }

  async getCustomerById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new Error('Customer not found');
    }
    return customer;
  }

  async createCustomer(data: CreateCustomerDTO): Promise<Customer> {
    // Check if email already exists
    const existingCustomer = await this.customerRepository.findByEmail(data.email);
    if (existingCustomer) {
      throw new Error('Customer with this email already exists');
    }

    return this.customerRepository.create(data);
  }

  async updateCustomer(id: string, data: UpdateCustomerDTO): Promise<Customer> {
    // Check if customer exists
    await this.getCustomerById(id);

    // If email is being updated, check if it's already in use by another customer
    if (data.email) {
      const existingCustomer = await this.customerRepository.findByEmail(data.email);
      if (existingCustomer && existingCustomer.id !== id) {
        throw new Error('Email is already in use by another customer');
      }
    }

    return this.customerRepository.update(id, data);
  }

  async deleteCustomer(id: string): Promise<Customer> {
    // Check if customer exists
    await this.getCustomerById(id);

    return this.customerRepository.delete(id);
  }
}
