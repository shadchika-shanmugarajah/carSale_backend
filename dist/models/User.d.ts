export interface IUser {
    username: string;
    password: string;
    role?: string;
    comparePassword(candidate: string): Promise<boolean>;
}
declare const _default: import("mongoose").Model<IUser, {}, {}, {}, import("mongoose").Document<unknown, {}, IUser> & IUser & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map