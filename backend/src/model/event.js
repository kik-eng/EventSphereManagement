const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  venue: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  bannerUrl: { type: String, default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop' },
  ticketPrice: { type: Number, default: 0 },
  status: { type: String, enum: ['Upcoming', 'Live', 'Completed'], default: 'Upcoming' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);