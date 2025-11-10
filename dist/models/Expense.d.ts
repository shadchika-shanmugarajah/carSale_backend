import { Types } from 'mongoose';
export interface IExpense {
    category?: string;
    description?: string;
    amount: number;
    date: Date;
    currency?: string;
    paymentMethod?: string;
    notes?: string;
    createdBy?: Types.ObjectId;
}
declare const _default: import("mongoose").Model<IExpense, {}, {}, {}, import("mongoose").Document<unknown, {}, IExpense> & IExpense & {
    _id: Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Expense.d.ts.map