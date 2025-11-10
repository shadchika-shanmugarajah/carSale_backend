import { Router } from 'express';
import auth from './auth';
import expenses from './expenses';
import vehicleOrders from './vehicleOrders';
import customers from './customers';
import inventory from './inventory';
import transactions from './transactions';

const router = Router();
router.use('/auth', auth);
router.use('/expenses', expenses);
router.use('/vehicle-orders', vehicleOrders);
router.use('/customers', customers);
router.use('/inventory', inventory);
router.use('/transactions', transactions);
router.get('/health', (_req, res) => res.json({ ok: true }));
export default router;