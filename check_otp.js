const mongoose = require('mongoose');
const dotenv = require('dotenv');
const OTP = require('./models/OTP');

dotenv.config();

const checkOTP = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const latestOTP = await OTP.findOne().sort({ createdAt: -1 });
        if (latestOTP) {
            console.log('Latest OTP Record:', JSON.stringify(latestOTP, null, 2));
        } else {
            console.log('No OTP records found');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
};

checkOTP();
