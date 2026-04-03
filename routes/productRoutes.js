const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, createProductReview, updateProductReview, deleteProductReview, upload, uploadExcel, getSearchSuggestions, bulkUploadProducts } = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');
const Product = require('../models/Product');
const Category = require('../models/Category');

router.route('/')
    .get(getProducts)
    .post(protect, admin, upload.array('images', 50), createProduct);

// Static routes MUST come before /:id to avoid being matched as product IDs
router.route('/bulk-upload').post(protect, admin, uploadExcel.single('excelFile'), bulkUploadProducts);

router.route('/search/suggestions').get(getSearchSuggestions);
router.route('/home').get(asyncHandler(async (req, res) => {
    console.log('GET /api/products/home - Initiating batch fetch...');
    
    // Fetch all categories once to avoid repeated findOne calls
    const categories = await Category.find({ 
        name: { $in: ['Laser', 'Inkjet', 'Ink & Toner'] } 
    }).lean();
    
    const findCatId = (name) => {
        const cat = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
        return cat ? cat._id : null;
    };

    const getCategoryProducts = async (slug, usage = false) => {
        try {
            let query = {};
            if (usage) {
                query.usageCategory = { $in: [slug] };
            } else {
                const catId = findCatId(slug);
                if (catId) query.category = catId;
                else return [];
            }
            return await Product.find(query).limit(4).populate('category', 'name').lean();
        } catch (err) {
            console.error(`Error fetching products for ${slug}:`, err);
            return [];
        }
    };

    // Parallel fetch with timeout safety
    const results = await Promise.all([
        getCategoryProducts('Home', true),
        getCategoryProducts('Office', true),
        getCategoryProducts('Laser'),
        getCategoryProducts('Inkjet'),
        getCategoryProducts('Ink & Toner')
    ]);

    res.json({ 
        home: results[0], 
        office: results[1], 
        laser: results[2], 
        inkjet: results[3], 
        toner: results[4] 
    });
}));

router.route('/:id')
    .get(getProductById)
    .put(protect, admin, upload.array('images', 50), updateProduct)
    .delete(protect, admin, deleteProduct);

router.route('/:id/reviews')
    .post(protect, createProductReview)
    .put(protect, updateProductReview)
    .delete(protect, deleteProductReview);

module.exports = router;