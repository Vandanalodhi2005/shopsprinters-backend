const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  category: { type: String, required: true },
  images: [String],
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', ProductSchema);

const products = [
  {
    name: "Brother DCP-L2640DW Compact Wireless Black & White Laser Printer",
    description: "Efficient monochrome laser multi-function printer with wireless networking and automatic duplex printing.",
    originalPrice: 239.99,
    salePrice: 209.99,
    category: "Laser Printers",
    images: ["https://i.ibb.co/680L6jP/dcp-l2640dw.webp"],
    inStock: true
  },
  {
    name: "Brother HL-L2405W Compact Wireless Black & White Laser Printer",
    description: "Compact monochrome laser printer with wireless networking and fast print speeds.",
    originalPrice: 149.99,
    salePrice: 139.99,
    category: "Laser Printers",
    images: ["https://i.ibb.co/mDY07vJ/hl-l2405w.webp"],
    inStock: true
  },
  {
    name: "Brother HL-L2460DW Compact Wireless Black & White Laser Printer",
    description: "Reliable monochrome laser printer with flexible connectivity and high-speed printing.",
    originalPrice: 199.99,
    salePrice: 179.99,
    category: "Laser Printers",
    images: ["https://i.ibb.co/XY3Z7Wc/hl-l2460dw.webp"],
    inStock: true
  },
  {
    name: "Brother MFC-L8900CDW Wireless Color Laser Printer",
    description: "High-performance color laser all-in-one printer for medium to large workgroups.",
    originalPrice: 749.99,
    salePrice: 719.99,
    category: "Laser Printers",
    images: ["https://i.ibb.co/YyY2X8P/mfc-l8900cdw.webp"],
    inStock: true
  },
  {
    name: "Brother Work Smart Wireless Color All-In-One Inkjet Printer",
    description: "Versatile ink-subscription ready printer perfect for home office and students.",
    originalPrice: 109.99,
    salePrice: 99.99,
    category: "Inkjet Printers",
    images: ["https://i.ibb.co/V9z0k4y/worksmart.webp"],
    inStock: true
  },
  {
    name: "Canon imageCLASS D1650 Wireless Monochrome Laser Multifunction Printer",
    description: "Robust monochrom laser printer designed for fast-paced small or medium environments.",
    originalPrice: 569.99,
    salePrice: 499.99,
    category: "Laser Printers",
    images: ["https://i.ibb.co/0Vf7m0B/canon-d1650.webp"],
    inStock: true
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB...");
    
    await Product.insertMany(products);
    console.log("Database Seeded Successfully!");
    
    process.exit();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
