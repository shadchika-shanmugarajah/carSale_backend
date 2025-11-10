import { Schema, model, Types } from 'mongoose';

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

const ExpenseSchema = new Schema<IExpense>({
  category: { type: String, default: '' },
  description: { type: String, default: '' },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  currency: { type: String, default: 'USD' },
  paymentMethod: { type: String, default: 'Cash' },
  notes: { type: String, default: '' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default model<IExpense>('Expense', ExpenseSchema);