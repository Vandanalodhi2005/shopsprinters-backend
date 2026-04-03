const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        console.log('\n--- CATEGORIES ---');
        const categories = await Category.find({});
        for (const c of categories) {
            console.log(`ID: ${c._id}, Name: "${c.name}", Slug: "${c.slug}"`);

            const count = await Product.countDocuments({ category: c._id });
            console.log(`   -> Product Count: ${count}`);
        }

        console.log('\n--- SAMPLE PRODUCTS IN INKJET/LASER ---');
        // Find Inkjet/Laser categories again to be sure
        const cats = await Category.find({ name: { $regex: /Printers/i } });

        for (const c of cats) {
            console.log(`\nProducts in category: ${c.name}`);
            const products = await Product.find({ category: c._id }).limit(5).select('title category usageCategory');
            products.forEach(p => {
                console.log(` - ${p.title} (Usage: ${p.usageCategory})`);
            });
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

connectDB();
