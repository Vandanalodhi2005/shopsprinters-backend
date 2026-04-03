const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const users = await User.find({}, 'name email firstName lastName isAdmin');
        console.log('Users in DB:', JSON.stringify(users, null, 2));
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
};

checkUsers();
