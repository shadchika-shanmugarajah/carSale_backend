import { Types } from 'mongoose';
export interface ICustomer {
    name: string;
    contact: string;
    email?: string;
    address?: string;
    nic?: string;
    createdBy?: Types.ObjectId;
}
declare const _default: import("mongoose").Model<ICustomer, {}, {}, {}, import("mongoose").Document<unknown, {}, ICustomer> & ICustomer & {
    _id: Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Customer.d.ts.map