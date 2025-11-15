import { Types } from 'mongoose';
export interface IInventoryItem {
    model: string;
    brand: string;
    year: number;
    color: string;
    vin?: string;
    chassisNo?: string;
    engineNo?: string;
    grade?: string;
    licensePlate?: string;
    fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
    engineSize?: string;
    transmission?: string;
    mileage?: number;
    purchasePrice: number;
    sellingPrice?: number;
    marketValue?: number;
    advancePayment?: number;
    currency: string;
    status: 'available' | 'reserved' | 'sold';
    location?: string;
    notes?: string;
    images?: string[];
    sourceOrderId?: Types.ObjectId;
    sourceOrderNumber?: string;
    createdBy?: Types.ObjectId;
}
declare const _default: import("mongoose").Model<IInventoryItem, {}, {}, {}, import("mongoose").Document<unknown, {}, IInventoryItem> & IInventoryItem & {
    _id: Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=InventoryItem.d.ts.map