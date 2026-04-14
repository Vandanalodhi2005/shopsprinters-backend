const asyncHandler = require('express-async-handler');
const { sendEmail } = require('../utils/emailService');
const ContactInquiry = require('../models/ContactInquiry');

// @desc    Send contact email & save to DB
// @route   POST /api/contact
// @access  Public
const sendContactEmail = asyncHandler(async (req, res) => {
    const { type } = req.body;

    // ── Handle default contact form ────────────────────────────────────
    if (!type || type === 'contact') {
        const { name, email, phone, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: 'Please fill in all required fields (name, email, subject, message).' });
        }

        // 1. Save to MongoDB FIRST so data is never lost
        let savedInquiry;
        try {
            savedInquiry = await ContactInquiry.create({ name, email, phone: phone || '', subject, message, type: 'contact' });
        } catch (dbError) {
            console.error('❌ DB save failed:', dbError.message);
        }

        // 2. Try sending email in background — doesn't block the 200 response
        const emailFrom = process.env.EMAIL_FROM || 'no-reply@innovationdynamicsgroup.com';
        const emailTo = process.env.CONTACT_RECEIVER_EMAIL || 'support@innovationdynamicsgroup.com';
        const safeName = (name || 'Contact Form').replace(/"/g, '');
        const emailSubject = `Contact Form: ${subject} from ${name}`;
        const html = `
<h3>New Contact Form Submission</h3>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone || 'N/A'}</p>
<p><strong>Subject:</strong> ${subject}</p>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>`;

        sendEmail({
            to: emailTo,
            subject: emailSubject,
            html,
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nSubject: ${subject}\n\nMessage:\n${message}`,
            from: `"${safeName}" <${emailFrom}>`,
            replyTo: email
        }).then(() => {
            console.log('✅ Contact email sent successfully');
            if (savedInquiry) {
                ContactInquiry.findByIdAndUpdate(savedInquiry._id, { emailSent: true }).catch(() => {});
            }
        }).catch((err) => {
            console.error('⚠️ Email send failed (data saved to DB):', err.message);
        });

        // 3. Always return success to the user
        return res.status(200).json({ message: 'Message received! We will get back to you soon.' });
    }

    // ── Handle return/exchange form ────────────────────────────────────
    if (type === 'return-exchange') {
        const { fullName, email, phone, orderNumber, orderDate, deliveryDate, productName, reason, itemCondition, resolution, additionalDetails } = req.body;

        if (!fullName || !email || !orderNumber) {
            return res.status(400).json({ message: 'Please fill in all required fields.' });
        }

        const emailFrom = process.env.EMAIL_FROM || 'no-reply@innovationdynamicsgroup.com';
        const emailTo = process.env.CONTACT_RECEIVER_EMAIL || 'support@innovationdynamicsgroup.com';
        const subject = `Return/Exchange Request: Order #${orderNumber} from ${fullName}`;
        const html = `
<h3>New Return/Exchange Request</h3>
<h4>Customer Information</h4>
<p><strong>Name:</strong> ${fullName}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Phone:</strong> ${phone || 'N/A'}</p>
<h4>Order Information</h4>
<p><strong>Order Number:</strong> ${orderNumber}</p>
<p><strong>Order Date:</strong> ${orderDate}</p>
<p><strong>Delivery Date:</strong> ${deliveryDate}</p>
<h4>Product Details</h4>
<p><strong>Product Name:</strong> ${productName || 'N/A'}</p>
<p><strong>Reason:</strong> ${reason || 'N/A'}</p>
<p><strong>Item Condition:</strong> ${itemCondition || 'N/A'}</p>
<h4>Resolution Requested</h4>
<p><strong>${resolution || 'N/A'}</strong></p>
<h4>Additional Details</h4>
<p>${(additionalDetails || 'N/A').replace(/\n/g, '<br>')}</p>`;

        sendEmail({
            to: emailTo,
            subject,
            html,
            from: `"${fullName}" <${emailFrom}>`,
            replyTo: email
        }).catch((err) => console.error('⚠️ Return/exchange email failed:', err.message));

        return res.status(200).json({ message: 'Return/exchange request submitted successfully.' });
    }

    return res.status(400).json({ message: 'Invalid request type.' });
});

module.exports = { sendContactEmail };
