/**
 * Migration Script: Add Default Title to All Existing Customers
 * Run this ONCE to update all customers without a title field
 */

const mongoose = require('mongoose');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carsale';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
  updateCustomers();
}).catch((err) => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// Define Customer schema
const CustomerSchema = new mongoose.Schema({
  name: String,
  title: String,
  contact: String,
  email: String,
  address: String,
  nic: String,
}, { timestamps: true });

const Customer = mongoose.model('Customer', CustomerSchema);

async function updateCustomers() {
  try {
    console.log('\n🔄 Starting customer title migration...\n');

    // Find all customers without a title
    const customers = await Customer.find({ 
      $or: [
        { title: { $exists: false } },
        { title: null },
        { title: '' }
      ]
    });

    console.log(`📊 Found ${customers.length} customers without title\n`);

    if (customers.length === 0) {
      console.log('✅ All customers already have titles!');
      mongoose.connection.close();
      return;
    }

    // Update each customer with default "Mr." title
    let updated = 0;
    for (const customer of customers) {
      await Customer.updateOne(
        { _id: customer._id },
        { $set: { title: 'Mr.' } }
      );
      console.log(`✅ Updated: ${customer.name} (${customer.contact}) → Title: "Mr."`);
      updated++;
    }

    console.log(`\n✨ Migration Complete!`);
    console.log(`📊 Updated ${updated} customers`);
    console.log(`\n💡 Note: All customers now have default title "Mr."`);
    console.log(`   You can change individual titles by creating new transactions\n`);

    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error updating customers:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

