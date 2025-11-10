"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VehicleOrder_1 = __importDefault(require("../models/VehicleOrder"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { page = 1, limit = 100, status, orderType } = req.query;
        const query = { createdBy: req.userId };
        if (status && status !== 'all') {
            query.orderStatus = status;
        }
        if (orderType) {
            query.orderType = orderType;
        }
        const orders = await VehicleOrder_1.default.find(query)
            .sort({ orderDate: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await VehicleOrder_1.default.countDocuments(query);
        res.json({
            orders,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            total
        });
    }
    catch (error) {
        console.error('Get vehicle orders error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const order = await VehicleOrder_1.default.findOne({
            _id: req.params.id,
            createdBy: req.userId
        });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ order });
    }
    catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { id, _id, ...bodyData } = req.body;
        const orderData = {
            ...bodyData,
            createdBy: req.userId,
            orderDate: req.body.orderDate ? new Date(req.body.orderDate) : new Date(),
            expectedArrivalDate: req.body.expectedArrivalDate ? new Date(req.body.expectedArrivalDate) : undefined,
            timeline: req.body.timeline?.map((t) => ({
                ...t,
                date: new Date(t.date)
            })) || []
        };
        const order = new VehicleOrder_1.default(orderData);
        await order.save();
        res.status(201).json({
            message: 'Order created successfully',
            order
        });
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const { id, _id, ...bodyData } = req.body;
        const updateData = { ...bodyData };
        if (updateData.orderDate)
            updateData.orderDate = new Date(updateData.orderDate);
        if (updateData.expectedArrivalDate)
            updateData.expectedArrivalDate = new Date(updateData.expectedArrivalDate);
        if (updateData.actualArrivalDate)
            updateData.actualArrivalDate = new Date(updateData.actualArrivalDate);
        if (updateData.deliveryDate)
            updateData.deliveryDate = new Date(updateData.deliveryDate);
        if (updateData.timeline) {
            updateData.timeline = updateData.timeline.map((t) => ({
                ...t,
                date: new Date(t.date)
            }));
        }
        const order = await VehicleOrder_1.default.findOneAndUpdate({ _id: req.params.id, createdBy: req.userId }, updateData, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({
            message: 'Order updated successfully',
            order
        });
    }
    catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const order = await VehicleOrder_1.default.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.userId
        });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    }
    catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/stats/summary', auth_1.requireAuth, async (req, res) => {
    try {
        const stats = await VehicleOrder_1.default.aggregate([
            { $match: { createdBy: req.userId } },
            {
                $group: {
                    _id: '$orderStatus',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$pricing.totalAmount' }
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
//# sourceMappingURL=vehicleOrders.js.map