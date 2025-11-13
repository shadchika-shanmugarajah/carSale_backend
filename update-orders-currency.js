const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carsale';

async function updateOrdersCurrency() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    const db = mongoose.connection.db;
    const VehicleOrders = db.collection('vehicleorders');

    // Find all orders without a currency field or with undefined currency
    const ordersWithoutCurrency = await VehicleOrders.find({
      $or: [
        { currency: { $exists: false } },
        { currency: null },
        { currency: undefined }
      ]
    }).toArray();

    console.log(`Found ${ordersWithoutCurrency.length} orders without currency field`);

    if (ordersWithoutCurrency.length > 0) {
      // Update all orders without currency to have 'USD' as default
      const result = await VehicleOrders.updateMany(
        {
          $or: [
            { currency: { $exists: false } },
            { currency: null },
            { currency: undefined }
          ]
        },
        {
          $set: { currency: 'USD' }
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} orders with default currency 'USD'`);
      
      // Display sample of updated orders
      const sampleUpdated = await VehicleOrders.find({}).limit(5).toArray();
      console.log('\nSample of orders after update:');
      sampleUpdated.forEach(order => {
        console.log(`  - Order ${order.orderNumber}: currency = ${order.currency}`);
      });
    } else {
      console.log('✅ All orders already have currency field');
    }

    await mongoose.connection.close();
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run the migration
updateOrdersCurrency();

