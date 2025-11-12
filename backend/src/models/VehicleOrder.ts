import { Schema, model, Types } from 'mongoose';

export interface IVehicleOrder {
  orderNumber: string;
  orderDate: Date;
  orderType?: 'customer' | 'import';  // Added to distinguish between customer orders and import orders
  customerName: string;
  customerContact: string;
  customerNIC?: string;
  supplier?: string;  // For import orders
  country?: string;   // For import orders
  vehicleDetails: {
    brand: string;
    model: string;
    year: number;
    color: string;
    chassisNo?: string;
    engineNo?: string;
    specifications?: string;
  };
  pricing: {
    vehiclePrice: number;
    taxes: number;
    fees: number;
    totalAmount: number;
  };
  expenses?: {
    fuel: number;
    duty: number;
    driverCharge: number;
    clearanceCharge: number;
    demurrage: number;
    tax: number;
    customExpenses: { [key: string]: number };
  };
  advancePayment: number;
  balanceAmount: number;
  orderStatus: 'pending' | 'confirmed' | 'in_transit' | 'arrived' | 'delivered' | 'cancelled';
  expectedArrivalDate?: Date;
  actualArrivalDate?: Date;
  deliveryDate?: Date;
  notes?: string;
  // LC Information
  lcAmount?: number;
  lcNumber?: string;
  lcBank?: string;
  // Basic Information
  grade?: string;
  biNumber?: string;
  customBasicInfo?: { [key: string]: string };
  timeline: {
    date: Date;
    status: string;
    description: string;
  }[];
  movedToInventory?: boolean;  // Track if vehicle has been moved to inventory
  inventoryItemId?: Types.ObjectId;  // Reference to the created inventory item
  movedToInventoryDate?: Date;  // When it was moved to inventory
  createdBy?: Types.ObjectId;
}

const VehicleOrderSchema = new Schema<IVehicleOrder>({
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
    customExpenses: { type: Schema.Types.Mixed, default: {} }
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
  // LC Information
  lcAmount: { type: Number },
  lcNumber: { type: String },
  lcBank: { type: String },
  // Basic Information
  grade: { type: String },
  biNumber: { type: String },
  customBasicInfo: { type: Schema.Types.Mixed },
  timeline: [{
    date: { type: Date, required: true },
    status: { type: String, required: true },
    description: { type: String, required: true }
  }],
  movedToInventory: { type: Boolean, default: false },
  inventoryItemId: { type: Schema.Types.ObjectId, ref: 'InventoryItem' },
  movedToInventoryDate: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default model<IVehicleOrder>('VehicleOrder', VehicleOrderSchema);


