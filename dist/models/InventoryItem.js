"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const InventoryItemSchema = new mongoose_1.Schema({
    model: { type: String, required: true },
    brand: { type: String, required: true },
    year: { type: Number, required: true },
    color: { type: String, required: true },
    vin: { type: String, unique: true, sparse: true },
    licensePlate: { type: String, unique: true, sparse: true },
    fuelType: {
        type: String,
        enum: ['gasoline', 'diesel', 'hybrid', 'electric'],
        required: true
    },
    engineSize: { type: String },
    transmission: { type: String },
    mileage: { type: Number },
    purchasePrice: { type: Number, required: true },
    sellingPrice: { type: Number },
    currency: { type: String, default: 'USD' },
    status: {
        type: String,
        enum: ['available', 'reserved', 'sold'],
        default: 'available'
    },
    location: { type: String },
    notes: { type: String },
    images: [{ type: String }],
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('InventoryItem', InventoryItemSchema);
//# sourceMappingURL=InventoryItem.js.map