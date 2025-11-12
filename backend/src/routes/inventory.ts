import { Router, Response } from 'express';
import InventoryItem from '../models/InventoryItem';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all inventory items
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 100, status, brand } = req.query;
    const query: any = { createdBy: req.userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (brand && brand !== 'all') {
      query.brand = brand;
    }
    
    const items = await InventoryItem.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));
    
    const total = await InventoryItem.countDocuments(query);
    
    res.json({
      items,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get item by ID
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const item = await InventoryItem.findOne({ 
      _id: req.params.id, 
      createdBy: req.userId 
    });
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new item
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    console.log('➕ CREATE INVENTORY');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔑 chassisNo:', req.body.chassisNo);
    console.log('🔑 engineNo:', req.body.engineNo);
    
    const item = new InventoryItem({
      ...req.body,
      createdBy: req.userId
    });
    
    await item.save();
    
    console.log('✅ CREATED ITEM:', JSON.stringify(item, null, 2));
    console.log('✅ Saved chassisNo:', item.chassisNo);
    console.log('✅ Saved engineNo:', item.engineNo);
    
    res.status(201).json({
      message: 'Inventory item created successfully',
      item
    });
  } catch (error: any) {
    console.error('Create item error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: messages 
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate value error', 
        error: 'VIN or License Plate already exists' 
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update item
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    console.log('🔄 UPDATE INVENTORY - ID:', req.params.id);
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    console.log('🔑 chassisNo:', req.body.chassisNo);
    console.log('🔑 engineNo:', req.body.engineNo);
    
    const item = await InventoryItem.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    console.log('✅ SAVED ITEM:', JSON.stringify(item, null, 2));
    console.log('✅ Saved chassisNo:', item.chassisNo);
    console.log('✅ Saved engineNo:', item.engineNo);
    
    res.json({
      message: 'Inventory item updated successfully',
      item
    });
  } catch (error: any) {
    console.error('Update item error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: messages 
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Duplicate value error', 
        error: 'VIN or License Plate already exists' 
      });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete item
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const item = await InventoryItem.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId
    });
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get inventory statistics
router.get('/stats/summary', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await InventoryItem.aggregate([
      { $match: { createdBy: req.userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$purchasePrice' }
        }
      }
    ]);
    
    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;


