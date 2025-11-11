import { Schema, model, Types } from 'mongoose';

export interface IInventoryItem {
  model: string;
  brand: string;
  year: number;
  color: string;
  vin?: string;
  licensePlate?: string;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  engineSize?: string;
  transmission?: string;
  mileage?: number;
  purchasePrice: number;
  sellingPrice?: number;
  currency: string;
  status: 'available' | 'reserved' | 'sold';
  location?: string;
  notes?: string;
  images?: string[];
  createdBy?: Types.ObjectId;
}

const InventoryItemSchema = new Schema<IInventoryItem>({
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
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default model<IInventoryItem>('InventoryItem', InventoryItemSchema);


