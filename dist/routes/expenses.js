"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Expense_1 = __importDefault(require("../models/Expense"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, startDate, endDate } = req.query;
        const query = { createdBy: req.userId };
        if (category)
            query.category = category;
        if (startDate || endDate) {
            query.date = {};
            if (startDate)
                query.date.$gte = new Date(startDate);
            if (endDate)
                query.date.$lte = new Date(endDate);
        }
        const expenses = await Expense_1.default.find(query)
            .sort({ date: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit))
            .populate('createdBy', 'username');
        const total = await Expense_1.default.countDocuments(query);
        res.json({
            expenses,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            total
        });
    }
    catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const expense = await Expense_1.default.findOne({
            _id: req.params.id,
            createdBy: req.userId
        }).populate('createdBy', 'username');
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.json({ expense });
    }
    catch (error) {
        console.error('Get expense error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { category, description, amount, date, currency } = req.body;
        if (!amount || !date) {
            return res.status(400).json({ message: 'Amount and date are required' });
        }
        const expense = new Expense_1.default({
            category: category || '',
            description: description || '',
            amount: Number(amount),
            date: new Date(date),
            currency: currency || 'USD',
            createdBy: req.userId
        });
        await expense.save();
        await expense.populate('createdBy', 'username');
        res.status(201).json({
            message: 'Expense created successfully',
            expense
        });
    }
    catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const { category, description, amount, date, currency } = req.body;
        const updateData = {};
        if (category !== undefined)
            updateData.category = category;
        if (description !== undefined)
            updateData.description = description;
        if (amount !== undefined)
            updateData.amount = Number(amount);
        if (date !== undefined)
            updateData.date = new Date(date);
        if (currency !== undefined)
            updateData.currency = currency;
        const expense = await Expense_1.default.findOneAndUpdate({ _id: req.params.id, createdBy: req.userId }, updateData, { new: true }).populate('createdBy', 'username');
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.json({
            message: 'Expense updated successfully',
            expense
        });
    }
    catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const expense = await Expense_1.default.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.userId
        });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }
        res.json({ message: 'Expense deleted successfully' });
    }
    catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/stats/summary', auth_1.requireAuth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const matchQuery = { createdBy: req.userId };
        if (startDate || endDate) {
            matchQuery.date = {};
            if (startDate)
                matchQuery.date.$gte = new Date(startDate);
            if (endDate)
                matchQuery.date.$lte = new Date(endDate);
        }
        const stats = await Expense_1.default.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' },
                    averageAmount: { $avg: '$amount' },
                    count: { $sum: 1 },
                    categories: { $addToSet: '$category' }
                }
            }
        ]);
        const categoryStats = await Expense_1.default.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);
        res.json({
            summary: stats[0] || { totalAmount: 0, averageAmount: 0, count: 0, categories: [] },
            categoryBreakdown: categoryStats
        });
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=expenses.js.map