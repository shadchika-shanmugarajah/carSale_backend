import { Router, Response } from 'express';
import VehicleOrder from '../models/VehicleOrder';
import InventoryItem from '../models/InventoryItem';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all vehicle orders
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 100, status, orderType } = req.query;
    const query: any = { createdBy: req.userId };
    
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    
    // Filter by orderType if provided
    if (orderType) {
      query.orderType = orderType;
    }
    
    const orders = await VehicleOrder.find(query)
      .sort({ orderDate: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));
    
    // DEBUG: Log currency in orders
    console.log('🔍 GET ORDERS - Number of orders:', orders.length);
    if (orders.length > 0) {
      console.log('🔍 GET ORDERS - Sample order currencies:');
      orders.slice(0, 3).forEach(order => {
        console.log(`  Order ${order.orderNumber}: currency="${order.currency}" (type: ${typeof order.currency})`);
      });
    }
    
    const total = await VehicleOrder.countDocuments(query);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total
    });
  } catch (error) {
    console.error('Get vehicle orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Move order to inventory - with duplicate prevention
// MUST be before /:id routes to avoid route matching conflicts
router.post('/:id/move-to-inventory', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Find the order
    const order = await VehicleOrder.findOne({
      _id: req.params.id,
      createdBy: req.userId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if already moved to inventory
    if (order.movedToInventory) {
      return res.status(400).json({ 
        message: 'This vehicle has already been moved to inventory',
        alreadyMoved: true,
        inventoryItemId: order.inventoryItemId,
        movedDate: order.movedToInventoryDate
      });
    }

    // Validate order status
    if (order.orderStatus !== 'arrived') {
      return res.status(400).json({ 
        message: 'Vehicle must be in "arrived" status before moving to inventory',
        currentStatus: order.orderStatus
      });
    }

    // Create inventory item
    const inventoryData = {
      model: order.vehicleDetails.model,
      brand: order.vehicleDetails.brand,
      year: order.vehicleDetails.year,
      color: order.vehicleDetails.color,
      chassisNo: order.vehicleDetails.chassisNo,  // Transfer chassis number
      engineNo: order.vehicleDetails.engineNo,    // Transfer engine number
      fuelType: 'gasoline' as const,  // Default value
      purchasePrice: order.pricing.totalAmount,
      // sellingPrice intentionally left undefined - to be set manually later
      currency: 'LKR',
      status: 'available' as const,
      location: 'Showroom',
      notes: `Moved from customer order: ${order.orderNumber}`,
      sourceOrderId: order._id,
      sourceOrderNumber: order.orderNumber,
      createdBy: req.userId
    };

    const inventoryItem = new InventoryItem(inventoryData);
    await inventoryItem.save();

    // Update the order to mark it as moved to inventory
    order.movedToInventory = true;
    order.inventoryItemId = inventoryItem._id;
    order.movedToInventoryDate = new Date();
    order.orderStatus = 'delivered';
    order.deliveryDate = new Date();
    
    // Add timeline entry
    order.timeline.push({
      date: new Date(),
      status: 'MOVED_TO_INVENTORY',
      description: `Vehicle moved to inventory (ID: ${inventoryItem._id})`
    });

    await order.save();

    res.status(201).json({
      message: 'Vehicle successfully moved to inventory',
      order,
      inventoryItem
    });
  } catch (error: any) {
    console.error('Move to inventory error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message
    });
  }
});

// Get order by ID
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const order = await VehicleOrder.findOne({ 
      _id: req.params.id, 
      createdBy: req.userId 
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new order
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Remove id and _id from request body - MongoDB will generate _id automatically
    const { id, _id, ...bodyData } = req.body;
    
    // DEBUG: Log currency received from frontend
    console.log('🔍 CREATE ORDER - Currency received from frontend:', req.body.currency);
    console.log('🔍 CREATE ORDER - Full body:', JSON.stringify(req.body, null, 2));
    
    const orderData = {
      ...bodyData,
      createdBy: req.userId,
      orderDate: req.body.orderDate ? new Date(req.body.orderDate) : new Date(),
      expectedArrivalDate: req.body.expectedArrivalDate ? new Date(req.body.expectedArrivalDate) : undefined,
      timeline: req.body.timeline?.map((t: any) => ({
        ...t,
        date: new Date(t.date)
      })) || []
    };
    
    console.log('🔍 CREATE ORDER - Currency in orderData before save:', orderData.currency);
    
    const order = new VehicleOrder(orderData);
    await order.save();
    
    console.log('🔍 CREATE ORDER - Currency after save:', order.currency);
    console.log('✅ Order saved with currency:', order.currency);
    
    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order
router.put('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Remove id and _id from request body - these should not be updated
    const { id, _id, ...bodyData } = req.body;
    const updateData: any = { ...bodyData };
    
    // DEBUG: Log currency received from frontend
    console.log('🔍 UPDATE ORDER - Currency received from frontend:', req.body.currency);
    console.log('🔍 UPDATE ORDER - bodyData currency:', bodyData.currency);
    
    // Convert date strings to Date objects
    if (updateData.orderDate) updateData.orderDate = new Date(updateData.orderDate);
    if (updateData.expectedArrivalDate) updateData.expectedArrivalDate = new Date(updateData.expectedArrivalDate);
    if (updateData.actualArrivalDate) updateData.actualArrivalDate = new Date(updateData.actualArrivalDate);
    if (updateData.deliveryDate) updateData.deliveryDate = new Date(updateData.deliveryDate);
    
    if (updateData.timeline) {
      updateData.timeline = updateData.timeline.map((t: any) => ({
        ...t,
        date: new Date(t.date)
      }));
    }
    
    console.log('🔍 UPDATE ORDER - Currency in updateData before save:', updateData.currency);
    
    const order = await VehicleOrder.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      updateData,
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    console.log('🔍 UPDATE ORDER - Currency after save:', order.currency);
    console.log('✅ Order updated with currency:', order.currency);
    
    res.json({
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete order
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const order = await VehicleOrder.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.userId
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order statistics
router.get('/stats/summary', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const stats = await VehicleOrder.aggregate([
      { $match: { createdBy: req.userId } },
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 },
          totalAmount: { $sum: '$pricing.totalAmount' }
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


