const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
const mongoose = require('mongoose');
require('dotenv').config();
const Item = require('./models/Item');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lost_and_found_db';

const sampleItems = [
  {
    itemName: 'HP Pavilion Laptop Charger (65W Blue Pin)',
    itemType: 'Lost',
    category: 'Electronics',
    description: 'Black HP laptop charger left plugged in near station 14 during afternoon DBMS laboratory.',
    location: 'Computer Lab 3, Department Block B',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    contactName: 'Rahul Sharma (CSE-3rd Year)',
    contactDetails: 'rahul.sharma@college.edu | +91 98765 43210',
    status: 'Active'
  },
  {
    itemName: 'College Student Identity Card (Roll: CS2024-042)',
    itemType: 'Found',
    category: 'Documents & IDs',
    description: 'Blue lanyard identity card belonging to Priya Verma, Department of Computer Science & Engineering.',
    location: 'Central Library, Reference Section Table 4',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000),
    contactName: 'Library Circulation Desk',
    contactDetails: 'library@college.edu | Intercom: 402',
    status: 'Active'
  },
  {
    itemName: 'Brown Leather Titan Wallet',
    itemType: 'Lost',
    category: 'Wallets & Bags',
    description: 'Contains college transport bus pass, student debit card, and driver license. Kindly return!',
    location: 'College Cafeteria, Table near Juice Counter',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    contactName: 'Amit Patel',
    contactDetails: 'amit.patel@gmail.com | +91 91234 56789',
    status: 'Active'
  },
  {
    itemName: 'Honda Bike Key with Avengers Metal Keychain',
    itemType: 'Found',
    category: 'Keys',
    description: 'Found black ignition key with small silver padlock key on an Avengers circular metal ring.',
    location: 'Main Campus Two-Wheeler Parking near Gate 2',
    date: new Date(Date.now() - 6 * 60 * 60 * 1000),
    contactName: 'Campus Security Office',
    contactDetails: 'security.gate2@college.edu | Intercom: 101',
    status: 'Active'
  },
  {
    itemName: 'Engineering Mathematics-II Spiral Notebook',
    itemType: 'Lost',
    category: 'Books & Stationery',
    description: 'Classmate 200-page notebook with green spine, contains all Fourier transform problem sheets.',
    location: 'Auditorium Hall, 3rd Row Right Wing',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    contactName: 'Sneha Rao',
    contactDetails: 'sneha.rao@college.edu | +91 98888 77766',
    status: 'Resolved'
  },
  {
    itemName: 'boAt Rockerz 255 Pro+ Wireless Neckband',
    itemType: 'Found',
    category: 'Electronics',
    description: 'Teal green magnetic bluetooth neckband found on the stone bench under the tree.',
    location: 'Sports Ground Pavilion',
    date: new Date(Date.now() - 18 * 60 * 60 * 1000),
    contactName: 'Karan Singh',
    contactDetails: 'karan.s@college.edu | +91 97777 22211',
    status: 'Active'
  },
  {
    itemName: 'Scientific Calculator Casio fx-991EX ClassWiz',
    itemType: 'Lost',
    category: 'Electronics',
    description: 'Black and white Casio scientific calculator with initials "RK" written on the back cover with silver marker.',
    location: 'Mechanical Block, Seminar Hall 2',
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    contactName: 'Rohan Kulkarni',
    contactDetails: 'rohan.k@college.edu | +91 94444 33221',
    status: 'Active'
  },
  {
    itemName: 'Fastrack Blue Polarized Sunglasses with Case',
    itemType: 'Found',
    category: 'Clothing & Accessories',
    description: 'Blue frame sunglasses inside a black hard zipper case found on the corridor bench.',
    location: 'Management Studies Block, 1st Floor Corridor',
    date: new Date(Date.now() - 8 * 60 * 60 * 1000),
    contactName: 'Neha Deshmukh',
    contactDetails: 'neha.d@college.edu',
    status: 'Resolved'
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected! Clearing existing demo data...');
    await Item.deleteMany({});
    console.log('Inserting 8 realistic college lost and found items...');
    await Item.insertMany(sampleItems);
    console.log('✅ Successfully seeded sample items into MongoDB!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
