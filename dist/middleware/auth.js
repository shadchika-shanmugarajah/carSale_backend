"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET || 'dev-secret';
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header)
        return res.status(401).json({ message: 'Missing Authorization header' });
    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer')
        return res.status(401).json({ message: 'Invalid Authorization header' });
    const token = parts[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, SECRET);
        req.userId = payload.id;
        next();
    }
    catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
}
//# sourceMappingURL=auth.js.map