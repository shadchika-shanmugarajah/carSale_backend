const mongoose = require('mongoose');

// Connect to MongoDB
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/carsale';

mongoose.connect(uri)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Define the schema (simplified)
    const VehicleOrderSchema = new mongoose.Schema({}, { strict: false });
    const VehicleOrder = mongoose.model('VehicleOrder', VehicleOrderSchema);
    
    // Get the last 5 orders
    const orders = await VehicleOrder.find().sort({ createdAt: -1 }).limit(5).lean();
    
    console.log('\n📋 Checking last 5 orders for LC Charge:');
    console.log('='.repeat(60));
    
    orders.forEach((order, index) => {
      console.log(`\nOrder ${index + 1}: ${order.orderNumber || order._id}`);
      console.log(`  Order Date: ${order.orderDate}`);
      console.log(`  Model: ${order.vehicleDetails?.model || 'N/A'}`);
      console.log(`  Expenses object exists: ${!!order.expenses}`);
      if (order.expenses) {
        console.log(`  expenses.lcCharge: ${order.expenses.lcCharge} (type: ${typeof order.expenses.lcCharge})`);
        console.log(`  Full expenses:`, JSON.stringify(order.expenses, null, 2));
      } else {
        console.log(`  ⚠️  No expenses object found!`);
      }
      console.log(`  Raw document has expenses: ${!!order.expenses}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Check complete');
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });

