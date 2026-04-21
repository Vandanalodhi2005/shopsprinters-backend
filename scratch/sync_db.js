const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    brand: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Category' },
    description: { type: String },
    price: { type: Number, required: true, default: 0 },
    oldPrice: { type: Number, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
    images: [String],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const fixDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("DB Connected for Fix...");

    // 1. Get an Admin User
    let admin = await User.findOne({ isAdmin: true });
    if (!admin) {
        console.log("No admin found. Searching for any user...");
        admin = await User.findOne({});
    }
    if (!admin) throw new Error("Please register a user first!");
    console.log(`Using user ID: ${admin._id}`);

    // 2. Setup Categories
    const categories = ['Laser Printers', 'Inkjet Printers', 'All-In-One Printers'];
    const categoryMap = {};
    for (const catName of categories) {
        let cat = await Category.findOne({ name: catName });
        if (!cat) {
            cat = await Category.create({ name: catName, description: `${catName} collection.` });
        }
        categoryMap[catName] = cat._id;
    }
    console.log("Categories ready.");

    // 3. Clear Existing Products to avoid confusion
    await Product.deleteMany({});
    console.log("Cleared old products.");

    // 4. Products with CORRECT SCHEMA
    const products = [
        {
          title: "Brother DCP-L2640DW Compact Wireless Black & White Laser Printer",
          brand: "Brother",
          description: "Efficient monochrome laser multi-function printer with wireless networking and automatic duplex printing.",
          oldPrice: 239.99,
          price: 209.99,
          category: categoryMap["Laser Printers"],
          images: ["https://i.ibb.co/680L6jP/dcp-l2640dw.webp"],
          countInStock: 10,
          user: admin._id
        },
        {
          title: "Brother HL-L2405W Compact Wireless Black & White Laser Printer",
          brand: "Brother",
          description: "Compact monochrome laser printer with wireless networking and fast print speeds.",
          oldPrice: 149.99,
          price: 139.99,
          category: categoryMap["Laser Printers"],
          images: ["https://i.ibb.co/mDY07vJ/hl-l2405w.webp"],
          countInStock: 15,
          user: admin._id
        },
        {
          title: "Brother HL-L2460DW Compact Wireless Black & White Laser Printer",
          brand: "Brother",
          description: "Reliable monochrome laser printer with flexible connectivity and high-speed printing.",
          oldPrice: 199.99,
          price: 179.99,
          category: categoryMap["Laser Printers"],
          images: ["https://i.ibb.co/XY3Z7Wc/hl-l2460dw.webp"],
          countInStock: 12,
          user: admin._id
        },
        {
          title: "Brother MFC-L8900CDW Wireless Color Laser Printer",
          brand: "Brother",
          description: "High-performance color laser all-in-one printer for medium to large workgroups.",
          oldPrice: 749.99,
          price: 719.99,
          category: categoryMap["Laser Printers"],
          images: ["https://i.ibb.co/YyY2X8P/mfc-l8900cdw.webp"],
          countInStock: 5,
          user: admin._id
        },
        {
          title: "Brother Work Smart Wireless Color All-In-One Inkjet Printer",
          brand: "Brother",
          description: "Versatile ink-subscription ready printer perfect for home office and students.",
          oldPrice: 109.99,
          price: 99.99,
          category: categoryMap["Inkjet Printers"],
          images: ["https://i.ibb.co/V9z0k4y/worksmart.webp"],
          countInStock: 20,
          user: admin._id
        },
        {
          title: "Canon imageCLASS D1650 Wireless Monochrome Laser Multifunction Printer",
          brand: "Canon",
          description: "Robust monochrom laser printer designed for fast-paced small or medium environments.",
          oldPrice: 569.99,
          price: 499.99,
          category: categoryMap["Laser Printers"],
          images: ["https://i.ibb.co/0Vf7m0B/canon-d1650.webp"],
          countInStock: 8,
          user: admin._id
        }
    ];

    // Add slugs
    const finalProducts = products.map(p => ({
        ...p,
        slug: p.title.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "-")
    }));

    await Product.insertMany(finalProducts);
    console.log("DATABASE SYNCED WITH CORRECT FIELDS!");

    process.exit();
  } catch (err) {
    console.error("Fix Error:", err);
    process.exit(1);
  }
};

fixDatabase();
