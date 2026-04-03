const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const countBrands = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const collection = mongoose.connection.collection('products');
        const brands = await collection.distinct('brand');
        console.log('Available Brands:', brands);

        for (const brand of brands) {
            const count = await collection.countDocuments({ brand: brand });
            console.log(`${brand}: ${count}`);
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

countBrands();
