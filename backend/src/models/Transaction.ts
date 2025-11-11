import { Schema, model, Types } from 'mongoose';

export interface ITransaction {
  customerId: Types.ObjectId;
  vehicleId?: Types.ObjectId;
  type: 'reservation' | 'sale' | 'leasing' | 'refund';
  status: 'pending' | 'partial_paid' | 'fully_paid' | 'completed' | 'overdue' | 'cancelled';
  invoiceNumber?: string;
  reservationDate?: Date;
  completionDate?: Date;
  currency: string;
  vehicleDetails: {
    brand: string;
    model: string;
    year: number;
    color: string;
    vin?: string;
    licensePlate?: string;
  };
  pricing: {
    vehiclePrice: number;
    taxes: number;
    fees: number;
    discount: number;
    totalAmount: number;
  };
  totalPaid: number;
  balanceRemaining: number;
  payments?: {
    date: Date;
    amount: number;
    method: string;
    reference?: string;
  }[];
  notes?: string;
  paymentMode?: 'cash' | 'bank_transfer' | 'leasing';
  isLeasing?: boolean;
  leasingDetails?: {
    leasingCompanyId: string;
    leasingCompanyName: string;
    leasingCompanyBranch?: string;
    leaseReferenceNo: string;
    downPayment: number;
    leasingAmount: number;
    monthlyInstallment: number;
    tenure: number;
    startDate: Date;
    endDate: Date;
    interestRate?: number;
  };
  createdBy?: Types.ObjectId;
}

const TransactionSchema = new Schema<ITransaction>({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'InventoryItem' },
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
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default model<ITransaction>('Transaction', TransactionSchema);


