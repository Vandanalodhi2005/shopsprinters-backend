const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const titles = ['HP LaserJet Pro M404dn', 'HP OfficeJet Pro 9015e', 'HP Smart Tank 7301'];
    for (const t of titles) {
        const p = await Product.findOne({ title: { $regex: new RegExp(t, 'i') } });
        console.log(`\n--- ${t} ---`);
        if (p) {
            console.log('Title:', p.title);
            console.log('Overview:', p.overview ? (p.overview.length + ' chars') : 'NONE');
            console.log('Specs:', p.technicalSpecification ? (p.technicalSpecification.length + ' chars') : 'NONE');
            console.log('Images:', JSON.stringify(p.images));
        } else {
            console.log('Not found');
        }
    }
    process.exit();
}
check();
