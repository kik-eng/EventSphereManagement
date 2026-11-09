const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['admin', 'exhibitor', 'attendee'],
      default: 'attendee',
    },
    // Exhibitor Specific Details (Agar role Exhibitor ho)
    // companyDetails: {
    //   companyName: { type: String, default: '' },
    //   logoUrl: { type: String, default: '' },
    //   description: { type: String, default: '' },
    // },
    companyDetails: {
  companyName: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  products: { type: [String], default: [] },
  contact: {
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    email: { type: String, default: '' },
  },
},
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model('User', userSchema);