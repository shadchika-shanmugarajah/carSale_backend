/**
 * Migration Script: Remove Auto-Calculated Selling Prices
 * 
 * This script finds inventory items where the selling price appears to be
 * auto-calculated (15% markup) and removes it, leaving it undefined.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const InventoryItemSchema = new mongoose.Schema({
  model: String,
  brand: String,
  year: Number,
  color: String,
  vin: String,
  chassisNo: String,
  engineNo: String,
  grade: String,
  licensePlate: String,
  fuelType: String,
  engineSize: String,
  transmission: String,
  mileage: Number,
  purchasePrice: Number,
  sellingPrice: Number,
  marketValue: Number,
  currency: String,
  status: String,
  location: String,
  notes: String,
  images: [String],
  sourceOrderId: mongoose.Schema.Types.ObjectId,
  sourceOrderNumber: String,
  createdBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const InventoryItem = mongoose.model('InventoryItem', InventoryItemSchema);

async function fixSellingPrices() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carsale');
    console.log('✅ Connected to MongoDB');

    // Find all inventory items that have both purchasePrice and sellingPrice
    const items = await InventoryItem.find({
      purchasePrice: { $exists: true },
      sellingPrice: { $exists: true, $ne: null }
    });

    console.log(`\n📊 Found ${items.length} inventory items with selling prices`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const item of items) {
      const expectedAutoCalculated = item.purchasePrice * 1.15;
      const difference = Math.abs(item.sellingPrice - expectedAutoCalculated);
      
      // If the selling price is within 0.01 of 15% markup, it's likely auto-calculated
      if (difference < 0.01) {
        console.log(`\n🔧 Fixing: ${item.brand} ${item.model}`);
        console.log(`   Purchase: ${item.purchasePrice}`);
        console.log(`   Selling: ${item.sellingPrice} (auto-calculated)`);
        console.log(`   Removing selling price...`);
        
        await InventoryItem.updateOne(
          { _id: item._id },
          { $unset: { sellingPrice: "" } }
        );
        
        fixedCount++;
      } else {
        console.log(`\n✓ Keeping: ${item.brand} ${item.model}`);
        console.log(`   Purchase: ${item.purchasePrice}`);
        console.log(`   Selling: ${item.sellingPrice} (manually set)`);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Migration complete!`);
    console.log(`   Fixed (removed): ${fixedCount} items`);
    console.log(`   Kept (manual): ${skippedCount} items`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration
fixSellingPrices();

