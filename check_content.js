const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const titles = ['M404dn', '9015e', '7301'];
    for (const t of titles) {
        const all = await Product.find({ title: { $regex: new RegExp(t, 'i') } });
        console.log(`\n--- ${t} ---`);
        all.forEach(p => {
            console.log(`[${p._id}] Title: ${p.title} | Price: ${p.price}`);
            console.log(`Overview: ${p.overview || 'MISSING'}`);
            console.log(`Specs: ${p.technicalSpecification || 'MISSING'}`);
        });
    }
    process.exit();
}
check();
