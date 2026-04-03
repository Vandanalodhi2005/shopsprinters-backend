const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const p = await Product.findOne({ title: /2755e/i });
    if (p) {
        console.log('--- PRODUCT DATA ---');
        console.log('Title:', p.title);
        console.log('Slug:', p.slug);
        console.log('Images:', JSON.stringify(p.images));
        console.log('Overview:', p.overview ? (p.overview.length + ' chars') : 'NONE');
        console.log('Technical Specs:', p.technicalSpecification ? (p.technicalSpecification.length + ' chars') : 'NONE');
        console.log('Description:', p.description ? (p.description.length + ' chars') : 'NONE');
    } else {
        console.log('Product not found for DeskJet 2755e');
    }
    process.exit();
}
check();
