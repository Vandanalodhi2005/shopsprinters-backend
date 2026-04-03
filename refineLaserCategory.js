const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const refineLaserCategory = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // 1. Get the Laser Printers category ID
        const laserCat = await Category.findOne({ name: 'Laser Printers' });
        if (!laserCat) {
            console.error('Laser Printers category not found!');
            process.exit(1);
        }
        console.log(`Laser Printers Category ID: ${laserCat._id}`);

        // 2. Move all products with technology 'Laser' or 'Laser (B/W)' to this category
        const updateResult = await Product.updateMany(
            { technology: { $in: ['Laser', 'Laser (B/W)'] } },
            { $set: { category: laserCat._id } }
        );

        console.log(`Updated ${updateResult.modifiedCount} products to "Laser Printers" category.`);

        // 3. Verification distribution check
        const products = await Product.find({ technology: { $in: ['Laser', 'Laser (B/W)'] } }).populate('category');
        const distribution = {};
        products.forEach(p => {
            const key = p.category ? (p.category.name || 'Missing Name') : 'Null Category';
            distribution[key] = (distribution[key] || 0) + 1;
        });
        console.log('Final Distribution for Laser technology products:', JSON.stringify(distribution, null, 2));

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

refineLaserCategory();
