const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Product = require('./models/Product');

dotenv.config();

const removeCategories = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const targets = ['Large Format', 'LED Printers'];

        for (const name of targets) {
            const cat = await Category.findOne({ name });
            if (cat) {
                const productCount = await Product.countDocuments({ category: cat._id });
                console.log(`Category "${name}" found with ${productCount} products.`);

                if (productCount > 0) {
                    console.log(`Warning: Products are assigned to "${name}". Not deleting category yet.`);
                    // You might want to reassign them here if needed
                } else {
                    await Category.deleteOne({ _id: cat._id });
                    console.log(`Category "${name}" deleted successfully.`);
                }
            } else {
                console.log(`Category "${name}" not found.`);
            }
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

removeCategories();
