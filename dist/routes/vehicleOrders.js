"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VehicleOrder_1 = __importDefault(require("../models/VehicleOrder"));
const InventoryItem_1 = __importDefault(require("../models/InventoryItem"));
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
        console.log('🔍 GET ORDERS - Number of orders:', orders.length);
        if (orders.length > 0) {
            console.log('🔍 GET ORDERS - Sample order currencies:');
            orders.slice(0, 3).forEach(order => {
                console.log(`  Order ${order.orderNumber}: currency="${order.currency}" (type: ${typeof order.currency})`);
            });
        }
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
router.post('/:id/move-to-inventory', auth_1.requireAuth, async (req, res) => {
    try {
        const order = await VehicleOrder_1.default.findOne({
            _id: req.params.id,
            createdBy: req.userId
        });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        if (order.movedToInventory) {
            return res.status(400).json({
                message: 'This vehicle has already been moved to inventory',
                alreadyMoved: true,
                inventoryItemId: order.inventoryItemId,
                movedDate: order.movedToInventoryDate
            });
        }
        if (order.orderStatus !== 'arrived') {
            return res.status(400).json({
                message: 'Vehicle must be in "arrived" status before moving to inventory',
                currentStatus: order.orderStatus
            });
        }
        const inventoryData = {
            model: order.vehicleDetails.model,
            brand: order.vehicleDetails.brand,
            year: order.vehicleDetails.year,
            color: order.vehicleDetails.color,
            chassisNo: order.vehicleDetails.chassisNo,
            engineNo: order.vehicleDetails.engineNo,
            fuelType: 'gasoline',
            purchasePrice: order.pricing.totalAmount,
            advancePayment: order.advancePayment || 0,
            currency: 'LKR',
            status: 'available',
            location: 'Showroom',
            notes: `Moved from customer order: ${order.orderNumber}`,
            sourceOrderId: order._id,
            sourceOrderNumber: order.orderNumber,
            createdBy: req.userId
        };
        console.log(`💰 Transferring advance payment: ${order.advancePayment} → inventory`);
        const inventoryItem = new InventoryItem_1.default(inventoryData);
        await inventoryItem.save();
        order.movedToInventory = true;
        order.inventoryItemId = inventoryItem._id;
        order.movedToInventoryDate = new Date();
        order.orderStatus = 'delivered';
        order.deliveryDate = new Date();
        order.timeline.push({
            date: new Date(),
            status: 'MOVED_TO_INVENTORY',
            description: `Vehicle moved to inventory (ID: ${inventoryItem._id})`
        });
        await order.save();
        res.status(201).json({
            message: 'Vehicle successfully moved to inventory',
            order,
            inventoryItem
        });
    }
    catch (error) {
        console.error('Move to inventory error:', error);
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
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
        console.log('🔍 CREATE ORDER - Currency received from frontend:', req.body.currency);
        console.log('🔍 CREATE ORDER - Full body:', JSON.stringify(req.body, null, 2));
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
        console.log('🔍 CREATE ORDER - Currency in orderData before save:', orderData.currency);
        const order = new VehicleOrder_1.default(orderData);
        await order.save();
        console.log('🔍 CREATE ORDER - Currency after save:', order.currency);
        console.log('✅ Order saved with currency:', order.currency);
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
        console.log('🔍 UPDATE ORDER - Currency received from frontend:', req.body.currency);
        console.log('🔍 UPDATE ORDER - bodyData currency:', bodyData.currency);
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
        console.log('🔍 UPDATE ORDER - Currency in updateData before save:', updateData.currency);
        const order = await VehicleOrder_1.default.findOneAndUpdate({ _id: req.params.id, createdBy: req.userId }, updateData, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        console.log('🔍 UPDATE ORDER - Currency after save:', order.currency);
        console.log('✅ Order updated with currency:', order.currency);
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