const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/model/userSchema');

const createAdmin = async () => {
  try {
    // Database Connection
const dbUri = process.env.DBURL || 'mongodb://localhost:27017/eventsphere';
    await mongoose.connect(dbUri);
    console.log('MongoDB connected for seeding...');

    // Check if Admin already exists
    const adminExists = await User.findOne({ email: 'admin@eventsphere.com' });
    if (adminExists) {
      console.log('Admin user existed already!');
      process.exit();
    }

    // Hash Admin Password
    const hashedPassword = await bcrypt.hash('admin12345', 10);

    // Create Admin Account
    await User.create({
      name: 'Super Admin',
      email: 'admin@eventsphere.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('🎉 Super Admin account successfully created!');
    console.log('Email: admin@eventsphere.com');
    console.log('Password: admin12345');
    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();