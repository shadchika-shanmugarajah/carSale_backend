"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/carsale';
mongoose_1.default.set('strictQuery', true);
mongoose_1.default.connect(uri)
    .then(() => {
    console.log('✅ Connected to MongoDB successfully');
})
    .catch((err) => {
    console.error('⚠️  MongoDB connection error:', err.message);
    console.error('\n⚠️  WARNING: Backend is running WITHOUT database connection!');
    console.error('⚠️  Database operations will fail until MongoDB is connected.');
    console.error('\n🔧 To fix:');
    console.error('   1. Whitelist your IP on MongoDB Atlas: https://cloud.mongodb.com/');
    console.error('   2. OR switch to local MongoDB in .env file\n');
});
mongoose_1.default.connection.on('connected', () => {
    console.log('✅ Mongoose connected to MongoDB');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err.message);
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('⚠️  Mongoose disconnected from MongoDB');
});
exports.default = mongoose_1.default;
//# sourceMappingURL=db.js.map