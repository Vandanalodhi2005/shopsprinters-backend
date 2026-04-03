const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        const products = await Product.find().limit(5);
        products.forEach(p => console.log(p.title, p.images));
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
