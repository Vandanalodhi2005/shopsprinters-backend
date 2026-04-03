const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const autoCategorize = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for auto-categorization...');

        // Fetch all categories
        const allCats = await Category.find({});
        const catMap = {};
        allCats.forEach(c => { catMap[c.slug] = c._id; });

        const products = await Product.find({});
        console.log(`Auditing ${products.length} products...`);

        let updatedCount = 0;

        for (const p of products) {
            let targetSlug = null;

            // Priority 1: Check usageCategory for Office/Home
            if (p.usageCategory && p.usageCategory.includes('Office')) {
                targetSlug = 'office-printers';
            } else if (p.usageCategory && p.usageCategory.includes('Home')) {
                targetSlug = 'home-printers';
            } 
            // Priority 2: Check technology for Laser/Inkjet if not categorized yet
            else if (p.technology && p.technology.includes('Laser')) {
                targetSlug = 'laser-printers';
            } else if (p.technology && p.technology.includes('Inkjet')) {
                targetSlug = 'inkjet-printers';
            }
            // Priority 3: Default to home if nothing matches and it's not a toner
            else if (!p.title.toLowerCase().includes('ink') && !p.title.toLowerCase().includes('toner')) {
                targetSlug = 'home-printers';
            } else {
                targetSlug = 'ink-toner';
            }

            if (targetSlug && catMap[targetSlug]) {
                const targetId = catMap[targetSlug];
                if (!p.category || p.category.toString() !== targetId.toString()) {
                    p.category = targetId;
                    await p.save();
                    updatedCount++;
                }
            }
        }

        console.log(`Auto-categorization complete! Updated ${updatedCount} products.`);
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

autoCategorize();
