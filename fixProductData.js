const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const fixProductData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        // Map titles or categories to professional images
        const imageGallery = {
            laser: 'https://images.unsplash.com/photo-1589828952857-e8a4a580662d?auto=format&fit=crop&q=80&w=800',
            inkjet: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=800',
            supertank: 'https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?auto=format&fit=crop&q=80&w=800',
            generic: 'https://images.unsplash.com/photo-1610473068565-89689408e063?auto=format&fit=crop&q=80&w=800'
        };

        const products = await Product.find({ images: { $size: 0 } });
        console.log(`Found ${products.length} products to fix.`);

        for (const p of products) {
            let selectedImage = imageGallery.generic;

            const title = p.title.toLowerCase();
            if (title.includes('laser')) {
                selectedImage = imageGallery.laser;
            } else if (title.includes('inkjet') || title.includes('pixma') || title.includes('expression')) {
                selectedImage = imageGallery.inkjet;
            } else if (title.includes('supertank') || title.includes('ecotank') || title.includes('megatank')) {
                selectedImage = imageGallery.supertank;
            }

            p.images = [selectedImage];
            await p.save();
            console.log(`Fixed: ${p.title} -> Assigned ${selectedImage}`);
        }

        console.log('Repair complete!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

fixProductData();
