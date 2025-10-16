import { Request, Response } from 'express';
import { CustomerService } from '../services/customerService';

export class CustomerController {
  private customerService: CustomerService;

  constructor(customerService: CustomerService) {
    this.customerService = customerService;
  }

  getAllCustomers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { search } = req.query;
      const customers = await this.customerService.getAllCustomers(search as string);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch customers' });
    }
  };

  getCustomerById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const customer = await this.customerService.getCustomerById(id);
      res.json(customer);
    } catch (error) {
      if (error instanceof Error && error.message === 'Customer not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch customer' });
      }
    }
  };

  createCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
      const customer = await this.customerService.createCustomer(req.body);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create customer' });
      }
    }
  };

  updateCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const customer = await this.customerService.updateCustomer(id, req.body);
      res.json(customer);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Customer not found') {
          res.status(404).json({ error: error.message });
        } else if (error.message.includes('already in use')) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Failed to update customer' });
        }
      } else {
        res.status(500).json({ error: 'Failed to update customer' });
      }
    }
  };

  deleteCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.customerService.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Customer not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete customer' });
      }
    }
  };
}
