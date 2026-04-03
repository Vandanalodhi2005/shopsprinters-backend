const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const refineOfficeCategory = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // 1. Identify and delete the 5 dummy products added previously
        const dummyTitles = [
            'HP Color LaserJet Pro MFP M479fdw',
            'Brother MFC-L8900CDW Business Color Laser',
            'Canon imageCLASS MF753Cdw Color Laser',
            'Epson WorkForce Pro WF-C5790 Network MFP',
            'Xerox VersaLink C405/DN Color Multifunction'
        ];

        const deleteResult = await Product.deleteMany({ title: { $in: dummyTitles } });
        console.log(`Deleted ${deleteResult.deletedCount} dummy products.`);

        // 2. Get the Office Printers category ID
        const officeCat = await Category.findOne({ name: 'Office Printers' });
        if (!officeCat) {
            console.error('Office Printers category not found!');
            process.exit(1);
        }
        console.log(`Office Printers Category ID: ${officeCat._id}`);

        // 3. Move all products with usageCategory 'Office' to this category
        // This includes orphaned ones and those currently in Laser/Home/etc.
        const updateResult = await Product.updateMany(
            { usageCategory: 'Office' },
            { $set: { category: officeCat._id } }
        );

        console.log(`Updated ${updateResult.modifiedCount} products to "Office Printers" category.`);

        // 4. Verification distribution check
        const products = await Product.find({ usageCategory: 'Office' }).populate('category');
        const distribution = {};
        products.forEach(p => {
            const key = p.category ? (p.category.name || 'Missing Name') : 'Null Category';
            distribution[key] = (distribution[key] || 0) + 1;
        });
        console.log('Final Distribution for Office usage products:', JSON.stringify(distribution, null, 2));

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

refineOfficeCategory();
