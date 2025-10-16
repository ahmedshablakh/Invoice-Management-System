import { Router } from 'express';
import { CustomerController } from '../controllers/customerController';

export function createCustomerRoutes(customerController: CustomerController): Router {
  const router = Router();

  router.get('/', customerController.getAllCustomers);
  router.get('/:id', customerController.getCustomerById);
  router.post('/', customerController.createCustomer);
  router.put('/:id', customerController.updateCustomer);
  router.delete('/:id', customerController.deleteCustomer);

  return router;
}
