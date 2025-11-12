"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const VehicleOrderSchema = new mongoose_1.Schema({
    orderNumber: { type: String, required: true, unique: true },
    orderDate: { type: Date, required: true },
    orderType: { type: String, enum: ['customer', 'import'], default: 'customer' },
    customerName: { type: String, required: true },
    customerContact: { type: String, required: true },
    customerNIC: { type: String },
    supplier: { type: String },
    country: { type: String },
    vehicleDetails: {
        brand: { type: String, required: true },
        model: { type: String, required: true },
        year: { type: Number, required: true },
        color: { type: String, required: true },
        chassisNo: { type: String },
        engineNo: { type: String },
        specifications: { type: String }
    },
    pricing: {
        vehiclePrice: { type: Number, required: true },
        taxes: { type: Number, required: true, default: 0 },
        fees: { type: Number, required: true, default: 0 },
        totalAmount: { type: Number, required: true }
    },
    expenses: {
        fuel: { type: Number, default: 0 },
        duty: { type: Number, default: 0 },
        driverCharge: { type: Number, default: 0 },
        clearanceCharge: { type: Number, default: 0 },
        demurrage: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        customExpenses: { type: mongoose_1.Schema.Types.Mixed, default: {} }
    },
    advancePayment: { type: Number, required: true, default: 0 },
    balanceAmount: { type: Number, required: true },
    orderStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'in_transit', 'arrived', 'delivered', 'cancelled'],
        default: 'pending'
    },
    expectedArrivalDate: { type: Date },
    actualArrivalDate: { type: Date },
    deliveryDate: { type: Date },
    notes: { type: String },
    lcAmount: { type: Number },
    lcNumber: { type: String },
    lcBank: { type: String },
    grade: { type: String },
    biNumber: { type: String },
    customBasicInfo: { type: mongoose_1.Schema.Types.Mixed },
    timeline: [{
            date: { type: Date, required: true },
            status: { type: String, required: true },
            description: { type: String, required: true }
        }],
    movedToInventory: { type: Boolean, default: false },
    inventoryItemId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'InventoryItem' },
    movedToInventoryDate: { type: Date },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('VehicleOrder', VehicleOrderSchema);
//# sourceMappingURL=VehicleOrder.js.map