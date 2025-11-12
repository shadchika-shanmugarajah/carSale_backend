import { Router, Response } from 'express';
import Expense from '../models/Expense';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all expenses for the authenticated user
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;
    const query: any = { createdBy: req.userId };
    
    // Add filters
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }
    
    const expenses = await Expense.find(query)
      .sort({ date: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit))
      .populate('createdBy', 'username');
    
    const total = await Expense.countDocuments(query);
    
    res.json({
      expenses,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get expense by ID
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findOne({ 
      _id: req.params.id, 
      createdBy: req.userId 
    }).populate('createdBy', 'username');
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ expense });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new expense
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { category, description, amount, date, currency } = req.body;
    
    if (!amount || !date) {
      return res.status(400).json({ message: 'Amount and date are required' });
    }
    
    const expense = new Expense({
      category: category || '',
      description: description || '',
      amount: Number(amount),
      date: new Date(date),
      currency: currency || 'USD',
      createdBy: req.userId
    });
    
    await expense.save();
    await expense.populate('createdBy', 'username');
    
    res.status(201).json({
      message: 'Expense created successfully',
      expense
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update expense
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { category, description, amount, date, currency } = req.body;
    
    const updateData: any = {};
    if (category !== undefined) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = Number(amount);
    if (date !== undefined) updateData.date = new Date(date);
    if (currency !== undefined) updateData.currency = currency;
    
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      updateData,
      { new: true }
    ).populate('createdBy', 'username');
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({
      message: 'Expense updated successfully',
      expense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete expense
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get expense statistics
router.get('/stats/summary', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const matchQuery: any = { createdBy: req.userId };
    
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate as string);
      if (endDate) matchQuery.date.$lte = new Date(endDate as string);
    }
    
    const stats = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          count: { $sum: 1 },
          categories: { $addToSet: '$category' }
        }
      }
    ]);
    
    const categoryStats = await Expense.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);
    
    res.json({
      summary: stats[0] || { totalAmount: 0, averageAmount: 0, count: 0, categories: [] },
      categoryBreakdown: categoryStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

