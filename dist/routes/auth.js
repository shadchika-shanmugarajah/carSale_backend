"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const SECRET = process.env.JWT_SECRET || 'dev-secret';
router.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const existingUser = await User_1.default.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        const user = new User_1.default({ username, password, role: role || 'user' });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username }, SECRET, { expiresIn: '7d' });
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: user._id, username: user.username, role: user.role }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        const user = await User_1.default.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username }, SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, username: user.username, role: user.role }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
});
router.get('/profile', auth_1.requireAuth, async (req, res) => {
    try {
        const user = await User_1.default.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.put('/profile', auth_1.requireAuth, async (req, res) => {
    try {
        const { username, role } = req.body;
        const updateData = {};
        if (username)
            updateData.username = username;
        if (role)
            updateData.role = role;
        const user = await User_1.default.findByIdAndUpdate(req.userId, updateData, { new: true, select: '-password' });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'Profile updated successfully', user });
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
router.post('/change-password', auth_1.requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }
        if (newPassword.length < 4) {
            return res.status(400).json({ message: 'New password must be at least 4 characters' });
        }
        const user = await User_1.default.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ message: 'Server error during password change' });
    }
});
router.post('/admin/reset-password', auth_1.requireAuth, async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        const currentUser = await User_1.default.findById(req.userId);
        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can reset passwords' });
        }
        if (!userId || !newPassword) {
            return res.status(400).json({ message: 'User ID and new password are required' });
        }
        if (newPassword.length < 4) {
            return res.status(400).json({ message: 'New password must be at least 4 characters' });
        }
        const targetUser = await User_1.default.findById(userId);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        targetUser.password = newPassword;
        await targetUser.save();
        res.json({ message: `Password reset successfully for user: ${targetUser.username}` });
    }
    catch (error) {
        console.error('Admin reset password error:', error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
});
router.get('/users', auth_1.requireAuth, async (req, res) => {
    try {
        const currentUser = await User_1.default.findById(req.userId);
        if (!currentUser || currentUser.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can view users' });
        }
        const users = await User_1.default.find().select('-password');
        res.json({ users });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map