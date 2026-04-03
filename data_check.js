const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const all = await Product.find({});
    
    const missingImg = all.filter(p => !p.images || p.images.length === 0);
    const missingOverview = all.filter(p => !p.overview || p.overview.length < 10);
    const missingSpecs = all.filter(p => !p.technicalSpecification || p.technicalSpecification.length < 10);

    console.log('Total Products:', all.length);
    console.log('Missing Images:', missingImg.length);
    console.log('Missing Overview:', missingOverview.length);
    console.log('Missing Specs:', missingSpecs.length);
    
    if (missingOverview.length > 0) {
        console.log('Examples with no overview:', missingOverview.slice(0, 5).map(p => p.title));
    }
    process.exit();
}
check();
