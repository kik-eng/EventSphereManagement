const mongoose = require('mongoose');

// Exhibitor ki "Expo/Event ke liye application"
const applicationSchema = new mongoose.Schema(
  {
    exhibitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    products: { type: [String], default: [] },
    message: { type: String, default: '', trim: true },
    documents: [
      {
        name: String,
        url: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminRemarks: { type: String, default: '' },
  },
  { timestamps: true }
);

// Ek exhibitor ek event ke liye sirf ek application
applicationSchema.index({ exhibitor: 1, event: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);