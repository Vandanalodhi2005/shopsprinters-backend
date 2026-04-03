const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');
const User = require('./models/User');

dotenv.config();

const seedOfficePrinters = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Find Category
        const officeCat = await Category.findOne({ name: 'Office Printers' });
        if (!officeCat) {
            console.error('Office Printers category not found. Make sure categories are seeded.');
            process.exit(1);
        }

        const adminUser = await User.findOne({ isAdmin: true }) || await User.findOne({});
        if (!adminUser) {
            console.error('No user found to assign products to.');
            process.exit(1);
        }

        const productsToAdd = [
            {
                user: adminUser._id,
                brand: 'HP',
                title: 'HP Color LaserJet Pro MFP M479fdw',
                description: 'The HP Color LaserJet Pro MFP M479 is designed to let you focus your time where it is most effective—growing your business and staying ahead of the competition. Features include automatic 2-sided printing, high-speed scanning, and robust security.',
                price: 599.00,
                countInStock: 15,
                category: officeCat._id,
                images: ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=800'],
                technology: ['Laser'],
                usageCategory: ['Office'],
                mainFunction: ['Print', 'Scan', 'Copy', 'Fax'],
                wireless: 'Yes',
                shortDetails: 'High-performance color laser multifunction printer'
            },
            {
                user: adminUser._id,
                brand: 'Brother',
                title: 'Brother MFC-L8900CDW Business Color Laser',
                description: 'The Brother MFC-L8900CDW color laser all-in-one is an exceptional choice for workgroups with higher print volumes that need low-cost printing and reliable, business-quality output. Advanced security features and high-yield cartridges.',
                price: 649.99,
                countInStock: 10,
                category: officeCat._id,
                images: ['https://images.unsplash.com/photo-1589828952857-e8a4a580662d?auto=format&fit=crop&q=80&w=800'],
                technology: ['Laser'],
                usageCategory: ['Office'],
                mainFunction: ['Print', 'Scan', 'Copy', 'Fax'],
                wireless: 'Yes',
                shortDetails: 'Premium business color laser all-in-one'
            },
            {
                user: adminUser._id,
                brand: 'Canon',
                title: 'Canon imageCLASS MF753Cdw Color Laser',
                description: 'The imageCLASS MF753Cdw is designed for small and medium-sized businesses, offering high-quality color output and fast printing speeds. It features an intuitive 5-inch color touchscreen and cloud-based features.',
                price: 549.00,
                countInStock: 20,
                category: officeCat._id,
                images: ['https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=800'],
                technology: ['Laser'],
                usageCategory: ['Office'],
                mainFunction: ['Print', 'Scan', 'Copy', 'Fax'],
                wireless: 'Yes',
                shortDetails: 'Professional color laser multifunction with cloud features'
            },
            {
                user: adminUser._id,
                brand: 'Epson',
                title: 'Epson WorkForce Pro WF-C5790 Network MFP',
                description: 'The Epson WorkForce Pro WF-C5790 is a high-speed, compact color multifunction printer. Powered by PrecisionCore technology, it delivers high-quality prints and features a replaceable ink pack system for reduced maintenance.',
                price: 299.00,
                countInStock: 25,
                category: officeCat._id,
                images: ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=800'],
                technology: ['Inkjet'],
                usageCategory: ['Office'],
                mainFunction: ['Print', 'Scan', 'Copy', 'Fax'],
                wireless: 'Yes',
                shortDetails: 'Fast, compact network color multifunction'
            },
            {
                user: adminUser._id,
                brand: 'Xerox',
                title: 'Xerox VersaLink C405/DN Color Multifunction',
                description: 'The VersaLink C405DN helps you get more work done faster with its brilliant color print quality and cloud-integrated workflow. This state-of-the-art office assistant is easy to use and provides consistent performance.',
                price: 699.00,
                countInStock: 8,
                category: officeCat._id,
                images: ['https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=800'],
                technology: ['Laser'],
                usageCategory: ['Office'],
                mainFunction: ['Print', 'Scan', 'Copy', 'Fax'],
                wireless: 'Yes',
                shortDetails: 'Enterprise-grade color multifunction printer'
            }
        ];

        for (const p of productsToAdd) {
            // Generate slug
            p.slug = p.title.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "-");

            // Check if exists
            const exists = await Product.findOne({ slug: p.slug });
            if (!exists) {
                await Product.create(p);
                console.log(`Added: ${p.title}`);
            } else {
                console.log(`Skipped (already exists): ${p.title}`);
            }
        }

        console.log('Office Printers seeding complete!');
        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedOfficePrinters();
