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
            .skip((Number(page) - 1) * Number(limit))
            .lean();
        console.log('🔍 GET ORDERS - Number of orders:', orders.length);
        if (orders.length > 0) {
            console.log('🔍 GET ORDERS - Sample order currencies:');
            orders.slice(0, 3).forEach((order) => {
                console.log(`  Order ${order.orderNumber}: currency="${order.currency}" (type: ${typeof order.currency})`);
                console.log(`  📋 LC CHARGE DEBUG - Order ${order.orderNumber}: expenses.lcCharge="${order.expenses?.lcCharge}" (type: ${typeof order.expenses?.lcCharge})`);
                console.log(`  📋 LC CHARGE DEBUG - Full expenses:`, JSON.stringify(order.expenses, null, 2));
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
        }).lean();
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        console.log(`📋 LC CHARGE DEBUG - GET BY ID (${req.params.id}):`);
        console.log(`  expenses.lcCharge:`, order?.expenses?.lcCharge, 'type:', typeof order?.expenses?.lcCharge);
        console.log(`  Full expenses:`, JSON.stringify(order?.expenses, null, 2));
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
        console.log('📋 LC CHARGE DEBUG - expenses.lcCharge received:', req.body.expenses?.lcCharge, 'type:', typeof req.body.expenses?.lcCharge);
        console.log('📋 LC CHARGE DEBUG - Full expenses object:', JSON.stringify(req.body.expenses, null, 2));
        console.log('📋 LC CHARGE DEBUG - Full req.body:', JSON.stringify(req.body, null, 2).substring(0, 1000));
        const expenses = req.body.expenses ? {
            fuel: Number(req.body.expenses.fuel) || 0,
            duty: Number(req.body.expenses.duty) || 0,
            driverCharge: Number(req.body.expenses.driverCharge) || 0,
            clearanceCharge: Number(req.body.expenses.clearanceCharge) || 0,
            demurrage: Number(req.body.expenses.demurrage) || 0,
            tax: Number(req.body.expenses.tax) || 0,
            lcCharge: (() => {
                const value = req.body.expenses.lcCharge;
                if (value !== undefined && value !== null && value !== '') {
                    const numValue = Number(value);
                    console.log('📋 LC CHARGE DEBUG - Raw value:', value, 'type:', typeof value, 'converted:', numValue);
                    return isNaN(numValue) ? 0 : numValue;
                }
                console.log('📋 LC CHARGE DEBUG - Value is undefined/null/empty, defaulting to 0');
                return 0;
            })(),
            customExpenses: req.body.expenses.customExpenses || {}
        } : {
            fuel: 0,
            duty: 0,
            driverCharge: 0,
            clearanceCharge: 0,
            demurrage: 0,
            tax: 0,
            lcCharge: 0,
            customExpenses: {}
        };
        console.log('📋 LC CHARGE DEBUG - Constructed expenses object:', JSON.stringify(expenses, null, 2));
        console.log('📋 LC CHARGE DEBUG - expenses.lcCharge in constructed object:', expenses.lcCharge);
        const { expenses: _, ...bodyDataWithoutExpenses } = bodyData;
        const orderData = {
            ...bodyDataWithoutExpenses,
            expenses: expenses,
            createdBy: req.userId,
            orderDate: req.body.orderDate ? new Date(req.body.orderDate) : new Date(),
            expectedArrivalDate: req.body.expectedArrivalDate ? new Date(req.body.expectedArrivalDate) : undefined,
            timeline: req.body.timeline?.map((t) => ({
                ...t,
                date: new Date(t.date)
            })) || []
        };
        console.log('🔍 CREATE ORDER - Currency in orderData before save:', orderData.currency);
        console.log('📋 LC CHARGE DEBUG - expenses.lcCharge in orderData:', orderData.expenses?.lcCharge);
        console.log('📋 LC CHARGE DEBUG - Full orderData.expenses:', JSON.stringify(orderData.expenses, null, 2));
        const order = new VehicleOrder_1.default(orderData);
        console.log('📋 LC CHARGE DEBUG - Before save, order.expenses?.lcCharge:', order.expenses?.lcCharge);
        console.log('📋 LC CHARGE DEBUG - orderData.expenses before creating model:', JSON.stringify(orderData.expenses, null, 2));
        if (orderData.expenses) {
            order.expenses = orderData.expenses;
            order.markModified('expenses');
        }
        console.log('📋 LC CHARGE DEBUG - After setting expenses, order.expenses?.lcCharge:', order.expenses?.lcCharge);
        await order.save();
        console.log('🔍 CREATE ORDER - Currency after save:', order.currency);
        console.log('✅ Order saved with currency:', order.currency);
        console.log('📋 LC CHARGE DEBUG - expenses.lcCharge after save:', order.expenses?.lcCharge, 'type:', typeof order.expenses?.lcCharge);
        console.log('📋 LC CHARGE DEBUG - Full expenses after save:', JSON.stringify(order.expenses, null, 2));
        const savedOrder = await VehicleOrder_1.default.findById(order._id).lean();
        console.log('📋 LC CHARGE DEBUG - Retrieved from DB, expenses.lcCharge:', savedOrder?.expenses?.lcCharge);
        console.log('📋 LC CHARGE DEBUG - Full saved order expenses:', JSON.stringify(savedOrder?.expenses, null, 2));
        const rawDoc = await VehicleOrder_1.default.collection.findOne({ _id: order._id });
        console.log('📋 LC CHARGE DEBUG - Raw MongoDB document expenses.lcCharge:', rawDoc?.expenses?.lcCharge);
        console.log('📋 LC CHARGE DEBUG - Raw MongoDB document expenses:', JSON.stringify(rawDoc?.expenses, null, 2));
        const orderToReturn = savedOrder || (order.toObject ? order.toObject() : order);
        console.log('📋 LC CHARGE DEBUG - Order being returned, expenses.lcCharge:', orderToReturn?.expenses?.lcCharge);
        res.status(201).json({
            message: 'Order created successfully',
            order: orderToReturn
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
        console.log('📋 LC CHARGE DEBUG - UPDATE: expenses.lcCharge received:', req.body.expenses?.lcCharge, 'type:', typeof req.body.expenses?.lcCharge);
        if (updateData.expenses && req.body.expenses) {
            const expenses = {
                fuel: req.body.expenses.fuel !== undefined ? Number(req.body.expenses.fuel) || 0 : updateData.expenses.fuel || 0,
                duty: req.body.expenses.duty !== undefined ? Number(req.body.expenses.duty) || 0 : updateData.expenses.duty || 0,
                driverCharge: req.body.expenses.driverCharge !== undefined ? Number(req.body.expenses.driverCharge) || 0 : updateData.expenses.driverCharge || 0,
                clearanceCharge: req.body.expenses.clearanceCharge !== undefined ? Number(req.body.expenses.clearanceCharge) || 0 : updateData.expenses.clearanceCharge || 0,
                demurrage: req.body.expenses.demurrage !== undefined ? Number(req.body.expenses.demurrage) || 0 : updateData.expenses.demurrage || 0,
                tax: req.body.expenses.tax !== undefined ? Number(req.body.expenses.tax) || 0 : updateData.expenses.tax || 0,
                lcCharge: (() => {
                    const value = req.body.expenses.lcCharge;
                    if (value !== undefined && value !== null && value !== '') {
                        const numValue = Number(value);
                        console.log('📋 LC CHARGE DEBUG - UPDATE: Raw value:', value, 'converted:', numValue);
                        return isNaN(numValue) ? 0 : numValue;
                    }
                    return updateData.expenses.lcCharge || 0;
                })(),
                customExpenses: req.body.expenses.customExpenses || updateData.expenses.customExpenses || {}
            };
            updateData.expenses = expenses;
            console.log('📋 LC CHARGE DEBUG - UPDATE: Constructed expenses:', JSON.stringify(expenses, null, 2));
        }
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
        console.log('📋 LC CHARGE DEBUG - UPDATE: expenses.lcCharge in updateData:', updateData.expenses?.lcCharge);
        const order = await VehicleOrder_1.default.findOneAndUpdate({ _id: req.params.id, createdBy: req.userId }, updateData, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        console.log('🔍 UPDATE ORDER - Currency after save:', order.currency);
        console.log('✅ Order updated with currency:', order.currency);
        console.log('📋 LC CHARGE DEBUG - UPDATE: expenses.lcCharge after save:', order.expenses?.lcCharge);
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