"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CustomerSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    title: { type: String, enum: ['Mr.', 'Mrs.', 'Ms.', 'Miss', 'Dr.'], default: 'Mr.' },
    contact: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    nic: { type: String },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Customer', CustomerSchema);
//# sourceMappingURL=Customer.js.map