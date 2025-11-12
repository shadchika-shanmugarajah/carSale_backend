import { Types } from 'mongoose';
export interface IVehicleOrder {
    orderNumber: string;
    orderDate: Date;
    orderType?: 'customer' | 'import';
    customerName: string;
    customerContact: string;
    customerNIC?: string;
    supplier?: string;
    country?: string;
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
        customExpenses: {
            [key: string]: number;
        };
    };
    advancePayment: number;
    balanceAmount: number;
    orderStatus: 'pending' | 'confirmed' | 'in_transit' | 'arrived' | 'delivered' | 'cancelled';
    expectedArrivalDate?: Date;
    actualArrivalDate?: Date;
    deliveryDate?: Date;
    notes?: string;
    lcAmount?: number;
    lcNumber?: string;
    lcBank?: string;
    grade?: string;
    biNumber?: string;
    customBasicInfo?: {
        [key: string]: string;
    };
    timeline: {
        date: Date;
        status: string;
        description: string;
    }[];
    movedToInventory?: boolean;
    inventoryItemId?: Types.ObjectId;
    movedToInventoryDate?: Date;
    createdBy?: Types.ObjectId;
}
declare const _default: import("mongoose").Model<IVehicleOrder, {}, {}, {}, import("mongoose").Document<unknown, {}, IVehicleOrder> & IVehicleOrder & {
    _id: Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=VehicleOrder.d.ts.map