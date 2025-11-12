"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const expenses_1 = __importDefault(require("./expenses"));
const vehicleOrders_1 = __importDefault(require("./vehicleOrders"));
const customers_1 = __importDefault(require("./customers"));
const inventory_1 = __importDefault(require("./inventory"));
const transactions_1 = __importDefault(require("./transactions"));
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
router.use('/expenses', expenses_1.default);
router.use('/vehicle-orders', vehicleOrders_1.default);
router.use('/customers', customers_1.default);
router.use('/inventory', inventory_1.default);
router.use('/transactions', transactions_1.default);
router.get('/health', (_req, res) => res.json({ ok: true }));
exports.default = router;
//# sourceMappingURL=index.js.map