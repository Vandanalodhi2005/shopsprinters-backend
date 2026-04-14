const mongoose = require('mongoose');

const contactInquirySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    emailSent: { type: Boolean, default: false },
    type: { type: String, default: 'contact' },
}, { timestamps: true });

module.exports = mongoose.model('ContactInquiry', contactInquirySchema);
