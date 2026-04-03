const asyncHandler = require('express-async-handler');
const ReturnRequest = require('../models/ReturnRequest');
const { sendEmail } = require('../utils/emailService');

// @desc    Create new return request
// @route   POST /api/returns
// @access  Public
const createReturnRequest = asyncHandler(async (req, res) => {
    const {
        fullName,
        email,
        phone,
        orderNumber,
        productName,
        reason,
        preferredResolution,
        details
    } = req.body;

    if (!fullName || !email || !orderNumber || !reason) {
        res.status(400);
        throw new Error('Please fill in all required fields');
    }

    const returnRequest = await ReturnRequest.create({
        fullName,
        email,
        phone,
        orderNumber,
        productName,
        reason,
        preferredResolution,
        details
    });

    if (returnRequest) {
        // Send notification email to admin
        const subject = `New Return/Exchange Request: Order #${orderNumber} from ${fullName}`;
        const text = `
Return/Exchange Request Details:

Customer: ${fullName}
Email: ${email}
Phone: ${phone || 'N/A'}
Order Number: ${orderNumber}
Product: ${productName}
Reason: ${reason}
Preferred Resolution: ${preferredResolution}
Details: ${details || 'N/A'}

Manage this request in the admin dashboard.
        `;

        const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
    <h2 style="color: #f97316;">New Return/Exchange Request</h2>
    <p>A new request has been submitted for order <strong>#${orderNumber}</strong>.</p>
    
    <div style="background-color: #f9fafb; padding: 20px; border-radius: 10px; border: 1px solid #e5e7eb;">
        <h3 style="margin-top: 0;">Customer Information</h3>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 15px 0;">
        
        <h3>Request Details</h3>
        <p><strong>Product:</strong> ${productName}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>Resolution:</strong> ${preferredResolution}</p>
        <p><strong>Additional Details:</strong></p>
        <p style="background: white; padding: 10px; border-radius: 5px; border: 1px solid #eee;">${details || 'No additional details provided.'}</p>
    </div>
    
    <p style="font-size: 12px; color: #666; margin-top: 20px;">
        This is an automated notification from your store backend.
    </p>
</div>
        `;

        try {
            await sendEmail({
                to: 'support@innovationdynamicsgroup.com',
                subject,
                text,
                html,
                from: `"${fullName}" <no-reply@innovationdynamicsgroup.com>`,
                replyTo: email
            });
        } catch (error) {
            console.error('Failed to send return request email notification:', error);
            // We still return 201 because the request WAS saved in the DB
        }

        res.status(201).json(returnRequest);
    } else {
        res.status(400);
        throw new Error('Invalid return request data');
    }
});

// @desc    Get all return requests (Admin)
// @route   GET /api/returns
// @access  Private/Admin
const getReturnRequests = asyncHandler(async (req, res) => {
    const requests = await ReturnRequest.find({}).sort({ createdAt: -1 });
    res.json(requests);
});

module.exports = {
    createReturnRequest,
    getReturnRequests
};
