import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from './models/User';
import Expense from './models/Expense';
import VehicleOrder from './models/VehicleOrder';
import Customer from './models/Customer';
import InventoryItem from './models/InventoryItem';
import Transaction from './models/Transaction';

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/carsale');
    console.log('Connected for seeding');

    // Create admin user
    let adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      adminUser = new User({ username: 'admin', password: 'pass', role: 'admin' });
      await adminUser.save();
      console.log('✅ Created admin user (username: admin, password: pass)');
    } else {
      console.log('✅ Admin user exists');
    }

    // Sample expenses
    const expenseCount = await Expense.countDocuments();
    if (expenseCount === 0) {
      await Expense.create([
        { category: 'Electric Bill', description: 'Monthly electricity bill', amount: 15000, date: new Date('2024-10-01'), currency: 'LKR', createdBy: adminUser._id },
        { category: 'Water Bill', description: 'Monthly water bill', amount: 3500, date: new Date('2024-10-01'), currency: 'LKR', createdBy: adminUser._id },
        { category: 'Showroom Maintenance', description: 'Cleaning and maintenance', amount: 25000, date: new Date('2024-10-05'), currency: 'LKR', createdBy: adminUser._id },
        { category: 'Rent', description: 'Monthly showroom rent', amount: 150000, date: new Date('2024-10-01'), currency: 'LKR', createdBy: adminUser._id }
      ]);
      console.log('✅ Inserted 4 sample expenses');
    } else {
      console.log(`✅ Expenses present: ${expenseCount}`);
    }

    // Sample customers
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      const customers = await Customer.create([
        { name: 'Ahmed Al-Rashid', contact: '+971-50-123-4567', email: 'ahmed@example.com', nic: '784-1985-1234567-1', createdBy: adminUser._id },
        { name: 'Sarah Johnson', contact: '+971-55-987-6543', email: 'sarah@example.com', nic: '784-1990-7654321-2', createdBy: adminUser._id },
        { name: 'Mohammed Hassan', contact: '+971-52-555-8888', email: 'mohammed@example.com', nic: '784-1988-9876543-3', createdBy: adminUser._id }
      ]);
      console.log(`✅ Inserted ${customers.length} sample customers`);
    } else {
      console.log(`✅ Customers present: ${customerCount}`);
    }

    // Sample vehicle orders
    const orderCount = await VehicleOrder.countDocuments();
    if (orderCount === 0) {
      await VehicleOrder.create([
        {
          orderNumber: 'ORD-2024-001',
          orderDate: new Date('2024-10-01'),
          customerName: 'Ahmed Al-Rashid',
          customerContact: '+971-50-123-4567',
          customerNIC: '784-1985-1234567-1',
          vehicleDetails: {
            brand: 'Toyota',
            model: 'Land Cruiser',
            year: 2024,
            color: 'Pearl White',
            specifications: 'V6, Full Option, Sunroof'
          },
          pricing: {
            vehiclePrice: 250000,
            taxes: 12500,
            fees: 2500,
            totalAmount: 265000
          },
          advancePayment: 50000,
          balanceAmount: 215000,
          orderStatus: 'in_transit',
          expectedArrivalDate: new Date('2024-11-15'),
          timeline: [
            { date: new Date('2024-10-01'), status: 'Order Placed', description: 'Customer placed order with advance payment' },
            { date: new Date('2024-10-05'), status: 'Order Confirmed', description: 'Order confirmed by supplier' },
            { date: new Date('2024-10-10'), status: 'In Transit', description: 'Vehicle shipped from Japan' }
          ],
          createdBy: adminUser._id
        },
        {
          orderNumber: 'ORD-2024-002',
          orderDate: new Date('2024-10-10'),
          customerName: 'Sarah Johnson',
          customerContact: '+971-55-987-6543',
          customerNIC: '784-1990-7654321-2',
          vehicleDetails: {
            brand: 'BMW',
            model: 'X7',
            year: 2024,
            color: 'Black Sapphire',
            specifications: 'M Sport, 7 Seater, Premium Package'
          },
          pricing: {
            vehiclePrice: 350000,
            taxes: 17500,
            fees: 3000,
            totalAmount: 370500
          },
          advancePayment: 100000,
          balanceAmount: 270500,
          orderStatus: 'confirmed',
          expectedArrivalDate: new Date('2024-12-01'),
          timeline: [
            { date: new Date('2024-10-10'), status: 'Order Placed', description: 'Customer placed order with advance payment' },
            { date: new Date('2024-10-12'), status: 'Order Confirmed', description: 'Order confirmed by supplier' }
          ],
          createdBy: adminUser._id
        }
      ]);
      console.log('✅ Inserted 2 sample vehicle orders');
    } else {
      console.log(`✅ Vehicle orders present: ${orderCount}`);
    }

    // Sample inventory items
    const inventoryCount = await InventoryItem.countDocuments();
    if (inventoryCount === 0) {
      await InventoryItem.create([
        {
          brand: 'Mercedes-Benz',
          model: 'E-Class',
          year: 2023,
          color: 'Silver',
          vin: 'WDD2130421A123456',
          fuelType: 'gasoline',
          engineSize: '2.0L',
          transmission: 'Automatic',
          mileage: 5000,
          purchasePrice: 180000,
          sellingPrice: 220000,
          currency: 'USD',
          status: 'available',
          location: 'Showroom A',
          createdBy: adminUser._id
        },
        {
          brand: 'Audi',
          model: 'Q5',
          year: 2024,
          color: 'Black',
          vin: 'WAU2GAFY1LN654321',
          fuelType: 'hybrid',
          engineSize: '2.0L',
          transmission: 'Automatic',
          mileage: 1200,
          purchasePrice: 150000,
          sellingPrice: 185000,
          currency: 'USD',
          status: 'available',
          location: 'Showroom B',
          createdBy: adminUser._id
        }
      ]);
      console.log('✅ Inserted 2 sample inventory items');
    } else {
      console.log(`✅ Inventory items present: ${inventoryCount}`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📝 Login credentials: username=admin, password=pass');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

run();