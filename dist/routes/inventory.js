"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const InventoryItem_1 = __importDefault(require("../models/InventoryItem"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.requireAuth, async (req, res) => {
    try {
        const { page = 1, limit = 100, status, brand } = req.query;
        const query = { createdBy: req.userId };
        if (status && status !== 'all') {
            query.status = status;
        }
        if (brand && brand !== 'all') {
            query.brand = brand;
        }
        const items = await InventoryItem_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit) * 1)
            .skip((Number(page) - 1) * Number(limit));
        const total = await InventoryItem_1.default.countDocuments(query);
        res.json({
            items,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            total
        });
    }
    catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const item = await InventoryItem_1.default.findOne({
            _id: req.params.id,
            createdBy: req.userId
        });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ item });
    }
    catch (error) {
        console.error('Get item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/', auth_1.requireAuth, async (req, res) => {
    try {
        console.log('➕ CREATE INVENTORY');
        console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
        console.log('🔑 chassisNo:', req.body.chassisNo);
        console.log('🔑 engineNo:', req.body.engineNo);
        const itemData = {
            ...req.body,
            createdBy: req.userId
        };
        if (!req.body.sellingPrice ||
            req.body.sellingPrice === 0 ||
            (req.body.purchasePrice && Math.abs(req.body.sellingPrice - (req.body.purchasePrice * 1.15)) < 0.01)) {
            delete itemData.sellingPrice;
            console.log('🚫 Removed auto-calculated or empty sellingPrice');
        }
        const item = new InventoryItem_1.default(itemData);
        await item.save();
        console.log('✅ CREATED ITEM:', JSON.stringify(item, null, 2));
        console.log('✅ Saved chassisNo:', item.chassisNo);
        console.log('✅ Saved engineNo:', item.engineNo);
        res.status(201).json({
            message: 'Inventory item created successfully',
            item
        });
    }
    catch (error) {
        console.error('Create item error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                message: 'Validation error',
                errors: messages
            });
        }
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Duplicate value error',
                error: 'VIN or License Plate already exists'
            });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
router.put('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        console.log('🔄 UPDATE INVENTORY - ID:', req.params.id);
        console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
        console.log('🔑 chassisNo:', req.body.chassisNo);
        console.log('🔑 engineNo:', req.body.engineNo);
        const updateData = { ...req.body };
        const unsetFields = {};
        if (!req.body.sellingPrice ||
            req.body.sellingPrice === 0 ||
            (req.body.purchasePrice && Math.abs(req.body.sellingPrice - (req.body.purchasePrice * 1.15)) < 0.01)) {
            delete updateData.sellingPrice;
            unsetFields.sellingPrice = "";
            console.log('🚫 Removed auto-calculated or empty sellingPrice from update');
        }
        const updateOperation = { $set: updateData };
        if (Object.keys(unsetFields).length > 0) {
            updateOperation.$unset = unsetFields;
        }
        const item = await InventoryItem_1.default.findOneAndUpdate({ _id: req.params.id, createdBy: req.userId }, updateOperation, { new: true, runValidators: true });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        console.log('✅ SAVED ITEM:', JSON.stringify(item, null, 2));
        console.log('✅ Saved chassisNo:', item.chassisNo);
        console.log('✅ Saved engineNo:', item.engineNo);
        res.json({
            message: 'Inventory item updated successfully',
            item
        });
    }
    catch (error) {
        console.error('Update item error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                message: 'Validation error',
                errors: messages
            });
        }
        if (error.code === 11000) {
            return res.status(400).json({
                message: 'Duplicate value error',
                error: 'VIN or License Plate already exists'
            });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    try {
        const item = await InventoryItem_1.default.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.userId
        });
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Inventory item deleted successfully' });
    }
    catch (error) {
        console.error('Delete item error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.get('/stats/summary', auth_1.requireAuth, async (req, res) => {
    try {
        const stats = await InventoryItem_1.default.aggregate([
            { $match: { createdBy: req.userId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalValue: { $sum: '$purchasePrice' }
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
//# sourceMappingURL=inventory.js.map