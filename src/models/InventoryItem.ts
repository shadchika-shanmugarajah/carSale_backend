import { Schema, model, Types } from 'mongoose';

export interface IInventoryItem {
  model: string;
  brand: string;
  year: number;
  color: string;
  vin?: string; // Chassis Number
  chassisNo?: string; // Alternative field name for Chassis Number
  engineNo?: string; // Engine Number
  grade?: string; // Vehicle grade (e.g., Premium, Standard, S, L)
  licensePlate?: string;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  engineSize?: string;
  transmission?: string;
  mileage?: number;
  purchasePrice: number;
  sellingPrice?: number;
  marketValue?: number;
  advancePayment?: number;  // Advance payment from customer order
  currency: string;
  status: 'available' | 'reserved' | 'sold';
  location?: string;
  notes?: string;
  images?: string[];
  sourceOrderId?: Types.ObjectId;  // Reference to the source vehicle order (if moved from order)
  sourceOrderNumber?: string;  // Order number for easy reference
  createdBy?: Types.ObjectId;
}

const InventoryItemSchema = new Schema<IInventoryItem>({
  model: { type: String, required: true },
  brand: { type: String, required: true },
  year: { type: Number, required: true },
  color: { type: String, required: true },
  vin: { type: String, unique: true, sparse: true }, // Chassis Number
  chassisNo: { type: String }, // Alternative field for Chassis Number
  engineNo: { type: String }, // Engine Number
  grade: { type: String }, // Vehicle grade
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
  marketValue: { type: Number },
  advancePayment: { type: Number, default: 0 },  // Advance payment from customer order
  currency: { type: String, default: 'USD' },
  status: { 
    type: String, 
    enum: ['available', 'reserved', 'sold'],
    default: 'available'
  },
  location: { type: String },
  notes: { type: String },
  images: [{ type: String }],
  sourceOrderId: { type: Schema.Types.ObjectId, ref: 'VehicleOrder' },
  sourceOrderNumber: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default model<IInventoryItem>('InventoryItem', InventoryItemSchema);


