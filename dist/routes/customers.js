"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Customer_1 = __importDefault(require("../models/Customer"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { page = 1, limit = 100, search } = req.query;
        const query = { createdBy: req.userId };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { contact: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        const customers = await Customer_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await Customer_1.default.countDocuments(query);
        res.json({
            customers,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            total
        });
    }
    catch (error) {
        console.error('Get customers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const customer = await Customer_1.default.findOne({
            _id: req.params.id,
            createdBy: req.userId
        });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({ customer });
    }
    catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const customer = new Customer_1.default({
            ...req.body,
            createdBy: req.userId
        });
        await customer.save();
        res.status(201).json({
            message: 'Customer created successfully',
            customer
        });
    }
    catch (error) {
        console.error('Create customer error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const customer = await Customer_1.default.findOneAndUpdate({ _id: req.params.id, createdBy: req.userId }, req.body, { new: true });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({
            message: 'Customer updated successfully',
            customer
        });
    }
    catch (error) {
        console.error('Update customer error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const customer = await Customer_1.default.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.userId
        });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    }
    catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=customers.js.map