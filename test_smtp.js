const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const testEmail = async () => {
    console.log('--- SMTP TEST (CONTROLLER FORMAT) ---');
    
    // Simulate what the controller does
    const fromName = "John Doe Test";
    const emailFrom = process.env.EMAIL_FROM || 'support@innovationdynamicsgroup.com';
    const receiver = process.env.CONTACT_RECEIVER_EMAIL || 'support@innovationdynamicsgroup.com';

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    try {
        const info = await transporter.sendMail({
            from: `"${fromName}" <${emailFrom}>`,
            to: receiver,
            subject: 'SMTP Test (Advanced Format) - Innovation Dynamics Group',
            text: 'Testing with Name in From field.',
            html: '<b>Testing with Name in From field.</b>'
        });
        console.log('✅ Success! Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
};

testEmail();
