const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Category = require('./models/Category');

dotenv.config();

const auditProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const products = await Product.find({}).populate('category');
        console.log(`Total Products: ${products.length}`);

        const issues = [];

        for (const p of products) {
            const pIssues = [];

            // Basic field checks
            if (!p.title) pIssues.push('Missing Title');
            if (!p.category) pIssues.push('Missing Category (or orphaned)');
            if (p.price === undefined || p.price === null || p.price <= 0) pIssues.push(`Invalid Price: ${p.price}`);
            if (p.countInStock < 0) pIssues.push(`Negative Stock: ${p.countInStock}`);

            // Image check
            if (!p.image && (!p.images || p.images.length === 0)) {
                pIssues.push('No Images');
            } else {
                const img = p.image || p.images[0];
                if (img.includes('placehold.co') || img.includes('placeholder')) {
                    pIssues.push(`Using Placeholder Image: ${img}`);
                }
            }

            // Category detail check
            if (p.category) {
                const catExists = await Category.findById(p.category._id);
                if (!catExists) pIssues.push(`Category ID ${p.category._id} does not exist in Categories collection`);
            }

            if (pIssues.length > 0) {
                issues.push({
                    product: p.title || `ID: ${p._id}`,
                    id: p._id,
                    issues: pIssues
                });
            }
        }

        if (issues.length === 0) {
            console.log('✅ All products look correct based on basic integrity checks.');
            const fs = require('fs');
            fs.writeFileSync('audit_results.json', JSON.stringify({ status: 'ok', count: products.length }, null, 2));
        } else {
            console.log(`\n❌ Found issues in ${issues.length} products. Saving to audit_results.json...`);
            const fs = require('fs');
            fs.writeFileSync('audit_results.json', JSON.stringify({ status: 'issues', count: products.length, issues }, null, 2));
        }

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

auditProducts();
