"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Transaction_1 = __importDefault(require("../models/Transaction"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { page = 1, limit = 100, status, type } = req.query;
        const query = { createdBy: req.userId };
        if (status && status !== 'all') {
            query.status = status;
        }
        if (type && type !== 'all') {
            query.type = type;
        }
        const transactions = await Transaction_1.default.find(query)
            .populate('customerId', 'name contact email')
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await Transaction_1.default.countDocuments(query);
        res.json({
            transactions,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            total
        });
    }
    catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const transaction = await Transaction_1.default.findOne({
            _id: req.params.id,
            createdBy: req.userId
        }).populate('customerId', 'name contact email nic address');
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json({ transaction });
    }
    catch (error) {
        console.error('Get transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        console.log('Creating transaction with body:', JSON.stringify(req.body, null, 2));
        const transactionData = {
            ...req.body,
            createdBy: req.userId,
            reservationDate: req.body.reservationDate ? new Date(req.body.reservationDate) : undefined,
            completionDate: req.body.completionDate ? new Date(req.body.completionDate) : undefined,
            payments: req.body.payments?.map((p) => ({
                ...p,
                date: new Date(p.date)
            })) || []
        };
        if (transactionData.leasingDetails) {
            transactionData.leasingDetails.startDate = new Date(transactionData.leasingDetails.startDate);
            transactionData.leasingDetails.endDate = new Date(transactionData.leasingDetails.endDate);
        }
        const transaction = new Transaction_1.default(transactionData);
        await transaction.save();
        await transaction.populate('customerId', 'name contact email');
        res.status(201).json({
            message: 'Transaction created successfully',
            transaction
        });
    }
    catch (error) {
        console.error('Create transaction error:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                message: 'Validation error: ' + messages.join(', '),
                errors: messages
            });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: `Invalid ${error.path}: ${error.value}`
            });
        }
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        console.log('Updating transaction:', req.params.id);
        console.log('Update data:', JSON.stringify(req.body, null, 2));
        const updateData = { ...req.body };
        if (updateData.reservationDate)
            updateData.reservationDate = new Date(updateData.reservationDate);
        if (updateData.completionDate)
            updateData.completionDate = new Date(updateData.completionDate);
        if (updateData.payments) {
            updateData.payments = updateData.payments.map((p) => ({
                ...p,
                date: p.date ? new Date(p.date) : (p.paymentDate ? new Date(p.paymentDate) : new Date())
            }));
        }
        if (updateData.leasingDetails && updateData.leasingDetails.startDate) {
            updateData.leasingDetails.startDate = new Date(updateData.leasingDetails.startDate);
            updateData.leasingDetails.endDate = new Date(updateData.leasingDetails.endDate);
        }
        const transaction = await Transaction_1.default.findOneAndUpdate({ _id: req.params.id, createdBy: req.userId }, updateData, { new: true, runValidators: true }).populate('customerId', 'name contact email');
        if (!transaction) {
            console.error('Transaction not found:', req.params.id);
            return res.status(404).json({ message: 'Transaction not found' });
        }
        console.log('Transaction updated successfully:', transaction._id);
        res.json({
            message: 'Transaction updated successfully',
            transaction
        });
    }
    catch (error) {
        console.error('Update transaction error:', error);
        console.error('Error details:', error.message);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                message: 'Validation error',
                errors: messages
            });
        }
        if (error.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid transaction ID format'
            });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const transaction = await Transaction_1.default.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.userId
        });
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.json({ message: 'Transaction deleted successfully' });
    }
    catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/stats/summary', auth_1.requireAuth, async (req, res) => {
    try {
        const stats = await Transaction_1.default.aggregate([
            { $match: { createdBy: req.userId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$pricing.totalAmount' },
                    totalPaid: { $sum: '$totalPaid' }
                }
            }
        ]);
        res.json({ stats });
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=transactions.js.map