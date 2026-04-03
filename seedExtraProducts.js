const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seed = async () => {
    await connectDB();

    try {
        // Find Categories
        const inkjetCat = await Category.findOne({ name: { $regex: /inkjet/i } });
        const laserCat = await Category.findOne({ name: { $regex: /laser/i } });

        if (!inkjetCat) console.log('Warning: Inkjet category not found');
        if (!laserCat) console.log('Warning: Laser category not found');

        if (!inkjetCat && !laserCat) {
            console.error('Neither category found. Exiting.');
            process.exit(1);
        }

        const adminUser = await User.findOne({ isAdmin: true }) || await User.findOne({});

        if (!adminUser) {
            console.error('No user found to assign products to.');
            process.exit(1);
        }

        const productsToAdd = [];

        if (inkjetCat) {
            productsToAdd.push(
                {
                    user: adminUser._id,
                    title: 'Canon PIXMA Home Office TR8620a',
                    images: ['https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=600'],
                    brand: 'Canon',
                    category: inkjetCat._id,
                    description: 'The Canon PIXMA TR8620a is the ultimate compact home office printer that’s easy to use and packed with features. Perfect for printing homework assignments, concert tickets, or family photos.',
                    price: 179.99,
                    countInStock: 50,
                    rating: 4.5,
                    numReviews: 12,
                    usageCategory: ['Home', 'Office'],
                    technology: ['Inkjet'],
                    mainFunction: ['Print', 'Scan', 'Copy', 'Fax'],
                    wireless: 'Yes',
                    shortDetails: 'Home Office All-in-One'
                },
                {
                    user: adminUser._id,
                    title: 'Epson WorkForce Pro WF-4820',
                    images: ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600'],
                    brand: 'Epson',
                    category: inkjetCat._id,
                    description: 'High-performance inkjet printer designed for heavy office use with fast print speeds and precisioncore heat-free technology.',
                    price: 249.99,
                    countInStock: 35,
                    rating: 4.2,
                    numReviews: 8,
                    usageCategory: ['Office'],
                    technology: ['Inkjet'],
                    mainFunction: ['Print', 'Scan', 'Copy', 'Fax'],
                    wireless: 'Yes',
                    shortDetails: 'Professional Office Inkjet'
                }
            );
        }

        if (laserCat) {
            productsToAdd.push(
                {
                    user: adminUser._id,
                    title: 'HP LaserJet Pro M404n',
                    images: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600'],
                    brand: 'HP',
                    category: laserCat._id,
                    description: 'Focus your time on growing your business and staying ahead with the HP LaserJet Pro M404n. A monochrome laser printer designed to let you focus your time where it’s most effective-growing your business and staying ahead of the competition.',
                    price: 289.00,
                    countInStock: 20,
                    rating: 4.7,
                    numReviews: 45,
                    usageCategory: ['Office'],
                    technology: ['Laser'],
                    mainFunction: ['Print Only'],
                    wireless: 'Yes',
                    shortDetails: 'Office Laser Printer'
                },
                {
                    user: adminUser._id,
                    title: 'Brother HL-L2370DW',
                    images: ['https://images.unsplash.com/photo-1589828952857-e8a4a580662d?w=600'],
                    brand: 'Brother',
                    category: laserCat._id,
                    description: 'Reliable, robust, and compact monochrome laser printer perfect for home use. prints up to 36 pages per minute and offers wireless networking.',
                    price: 129.99,
                    countInStock: 15,
                    rating: 4.4,
                    numReviews: 32,
                    usageCategory: ['Home'],
                    technology: ['Laser'],
                    mainFunction: ['Print Only'],
                    wireless: 'Yes',
                    shortDetails: 'Compact Home Laser'
                }
            );
        }

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

        console.log('Seeding complete!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seed();
