const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');

dotenv.config();

const baseCategories = [
    { name: 'Home Printers', slug: 'home-printers' },
    { name: 'Office Printers', slug: 'office-printers' },
    { name: 'Inkjet Printers', slug: 'inkjet-printers' },
    { name: 'Laser Printers', slug: 'laser-printers' },
    { name: 'Ink & Toner', slug: 'ink-toner' }
];

const seedBaseCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for category seeding...');

        for (const cat of baseCategories) {
            const exists = await Category.findOne({ slug: cat.slug });
            if (!exists) {
                await Category.create(cat);
                console.log(`Created category: ${cat.name}`);
            } else {
                console.log(`Category already exists: ${cat.name}`);
            }
        }

        console.log('Base categories seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedBaseCategories();
