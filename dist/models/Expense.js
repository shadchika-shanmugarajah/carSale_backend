"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ExpenseSchema = new mongoose_1.Schema({
    category: { type: String, default: '' },
    description: { type: String, default: '' },
    amount: { type: Number, required: true },
    date: { type: Date, required: true },
    currency: { type: String, default: 'USD' },
    paymentMethod: { type: String, default: 'Cash' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Expense', ExpenseSchema);
//# sourceMappingURL=Expense.js.map