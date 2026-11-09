const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hall name is required'],
      trim: true,
    },
    dimensions: {
      rows: {
        type: Number,
        required: [true, 'Number of rows is required'],
        min: [1, 'Rows must be at least 1'],
      },
      cols: {
        type: Number,
        required: [true, 'Number of columns is required'],
        min: [1, 'Columns must be at least 1'],
      },
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Hall', hallSchema);
