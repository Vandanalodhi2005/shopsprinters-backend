const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const inspectRawProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const collection = mongoose.connection.collection('products');

        // Find products with empty images array
        const problematicProducts = await collection.find({ images: { $size: 0 } }).toArray();
        console.log(`Found ${problematicProducts.length} products with empty images array.`);

        for (const p of problematicProducts) {
            console.log(`--- ${p.title} ---`);
            console.log(`ID: ${p._id}`);
            console.log(`Raw "image" field: ${p.image || 'UNDEFINED'}`);
            console.log(`Other fields: ${Object.keys(p).join(', ')}`);
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

inspectRawProducts();
