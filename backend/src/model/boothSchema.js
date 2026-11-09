const mongoose = require('mongoose');

const boothSchema = new mongoose.Schema(
  {
    boothNumber: {
      type: String,
      required: [true, 'Booth number is required'],
      trim: true,
    },
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hall',
      required: [true, 'Hall reference is required'],
    },
    category: {
      type: String,
      enum: ['VIP', 'Premium', 'Standard'],
      default: 'Standard',
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'booked'],
      default: 'available',
    },
    // Ref to the exhibitor user assigned to this booth (optional)
    assignedExhibitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Position on the visual grid
    gridPosition: {
      row: { type: Number, required: true },
      col: { type: Number, required: true },
    },
    // Exhibitor ke showcase aur staff
    details: {
      showcase: { type: [String], default: [] },
      staff: [
        {
          name: { type: String, required: true },
          role: String,
          phone: String,
        },
      ],
    },
    // Admin ne jo booth requests reject ki unka record
    rejections: [
      {
        exhibitor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        remarks: { type: String, default: '' },
        rejectedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Compound index to ensure unique booth position per hall
boothSchema.index({ hallId: 1, 'gridPosition.row': 1, 'gridPosition.col': 1 }, { unique: true });

module.exports = mongoose.model('Booth', boothSchema);