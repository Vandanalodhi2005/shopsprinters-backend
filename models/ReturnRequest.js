const mongoose = require('mongoose');

const returnRequestSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please add a full name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email']
    },
    phone: {
        type: String
    },
    orderNumber: {
        type: String,
        required: [true, 'Please add an order number']
    },
    productName: {
        type: String,
        required: false
    },
    reason: {
        type: String,
        required: [true, 'Please select a reason']
    },
    preferredResolution: {
        type: String,
        required: [true, 'Please select a preferred resolution']
    },
    details: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'approved', 'rejected', 'completed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
