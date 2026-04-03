const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const categoryName = "Laser Printers";
        console.log(`Searching for: "${categoryName}"`);

        // Exact logic from controller
        const category = await Category.findOne({ name: { $regex: new RegExp(`^${categoryName}$`, 'i') } });

        if (category) {
            console.log(`Found: "${category.name}"`);
        } else {
            console.log("Not found with exact regex.");
        }

        // Try fuzzy
        const fuzzy = await Category.find({ name: { $regex: /Ink/i } });
        console.log("Fuzzy match 'Ink':");
        fuzzy.forEach(c => console.log(`- "${c.name}"`));

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
