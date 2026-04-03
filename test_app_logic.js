const { sendEmail } = require('./utils/emailService');
const dotenv = require('dotenv');
dotenv.config();

const fullAppTest = async () => {
    console.log('--- Full App emailService Test ---');
    try {
        const result = await sendEmail({
            to: process.env.CONTACT_RECEIVER_EMAIL || 'support@innovationdynamicsgroup.com',
            subject: 'Full App Code Test',
            text: 'Testing exactly what the app uses.',
            html: '<b>Testing exactly what the app uses.</b>'
        });
        console.log('✅ Success! Result:', result.messageId);
    } catch (error) {
        console.error('❌ Failed with ERROR:', error);
    }
};

fullAppTest();
