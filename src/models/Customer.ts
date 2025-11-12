import { Schema, model, Types } from 'mongoose';

export interface ICustomer {
  name: string;
  title?: 'Mr.' | 'Mrs.' | 'Ms.' | 'Miss' | 'Dr.';
  contact: string;
  email?: string;
  address?: string;
  nic?: string;
  createdBy?: Types.ObjectId;
}

const CustomerSchema = new Schema<ICustomer>({
  name: { type: String, required: true },
  title: { type: String, enum: ['Mr.', 'Mrs.', 'Ms.', 'Miss', 'Dr.'], default: 'Mr.' },
  contact: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  nic: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default model<ICustomer>('Customer', CustomerSchema);


