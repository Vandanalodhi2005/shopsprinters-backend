const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const titles = ['M404dn', '9015e', '7301'];
    for (const t of titles) {
        const all = await Product.find({ title: { $regex: new RegExp(t, 'i') } });
        console.log(`\n--- Match: ${t} (${all.length} versions) ---`);
        all.forEach(p => {
            console.log(`[${p._id}] T: ${p.title} | P: ${p.price} | Desc: ${p.description?.substring(0, 30)}... | Images: ${p.images?.length}`);
        });
    }
    process.exit();
}
check();
