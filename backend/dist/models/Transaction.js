"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TransactionSchema = new mongoose_1.Schema({
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true },
    vehicleId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'InventoryItem' },
    type: {
        type: String,
        enum: ['reservation', 'sale', 'leasing', 'refund'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'partial_paid', 'fully_paid', 'completed', 'overdue', 'cancelled'],
        default: 'pending'
    },
    invoiceNumber: { type: String, unique: true, sparse: true },
    reservationDate: { type: Date },
    completionDate: { type: Date },
    currency: { type: String, default: 'USD' },
    vehicleDetails: {
        brand: { type: String, required: true },
        model: { type: String, required: true },
        year: { type: Number, required: true },
        color: { type: String, required: true },
        vin: { type: String },
        chassisNo: { type: String },
        engineNo: { type: String },
        licensePlate: { type: String }
    },
    pricing: {
        vehiclePrice: { type: Number, required: true },
        taxes: { type: Number, default: 0 },
        fees: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true }
    },
    totalPaid: { type: Number, default: 0 },
    balanceRemaining: { type: Number, required: true },
    payments: [{
            date: { type: Date, required: true },
            amount: { type: Number, required: true },
            method: { type: String, required: true },
            reference: { type: String }
        }],
    notes: { type: String },
    paymentMode: {
        type: String,
        enum: ['cash', 'bank_transfer', 'leasing'],
        default: 'cash'
    },
    isLeasing: { type: Boolean, default: false },
    leasingDetails: {
        leasingCompanyId: { type: String },
        leasingCompanyName: { type: String },
        leasingCompanyBranch: { type: String },
        leaseReferenceNo: { type: String },
        downPayment: { type: Number },
        leasingAmount: { type: Number },
        monthlyInstallment: { type: Number },
        tenure: { type: Number },
        startDate: { type: Date },
        endDate: { type: Date },
        interestRate: { type: Number }
    },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Transaction', TransactionSchema);
//# sourceMappingURL=Transaction.js.map