const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const auditLaserProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({ technology: { $in: ['Laser', 'Laser (B/W)'] } }).populate('category');
        console.log('Total products with Laser technology:', products.length);
        const distribution = {};
        products.forEach(p => {
            const key = p.category ? (p.category.name || 'Category has no name') : 'p.category is null';
            distribution[key] = (distribution[key] || 0) + 1;
        });
        console.log('Distribution by category:', JSON.stringify(distribution, null, 2));
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

auditLaserProducts();
