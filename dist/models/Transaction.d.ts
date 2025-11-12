import { Types } from 'mongoose';
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
        chassisNo?: string;
        engineNo?: string;
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
declare const _default: import("mongoose").Model<ITransaction, {}, {}, {}, import("mongoose").Document<unknown, {}, ITransaction> & ITransaction & {
    _id: Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Transaction.d.ts.map