
const mongoose = require('mongoose');
const crypto = require('crypto');

const registrationSchema = new mongoose.Schema(
    {
        attendee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true
        },

        ticketCode: {
            type: String,
            unique: true,
            default: () =>
                'ES-' + crypto.randomBytes(6).toString('hex').toUpperCase()
        },

        status: {
            type: String,
            enum: ['registered', 'cancelled'],
            default: 'registered'
        }
    },
    { timestamps: true }
);

registrationSchema.index(
    { attendee: 1, event: 1 },
    { unique: true }
);

module.exports = mongoose.model('Registration', registrationSchema);
