const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const IDS = {
    laser_m404dn: '6998b6e60d51a5d80a0c025e',
    inkjet_9015e: '6998b6e50d51a5d80a0c023e',
    inkjet_7301_cheap: '6998b6e60d51a5d80a0c025a'
};

const IMAGES = {
    laser: 'https://images.unsplash.com/photo-1616062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=800',
    inkjet: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=800'
};

async function targetedRepair() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // 1. Repair M404dn
    await Product.findByIdAndUpdate(IDS.laser_m404dn, {
        images: [IMAGES.laser],
        description: "The HP LaserJet Pro M404dn is designed to let you focus your time where it is most effective—growing your business and staying ahead of the competition. This monochrome laser printer features automatic duplexing and fast print speeds up to 40 ppm."
    });

    // 2. Repair 9015e
    await Product.findByIdAndUpdate(IDS.inkjet_9015e, {
        images: [IMAGES.inkjet],
        description: "The HP OfficeJet Pro 9015e is a revolutionary smart printer that works the way you need it. Help save time with Smart Tasks shortcuts, and get automatic two-sided scanning, easy mobile printing, and best-in-class security."
    });

    // 3. Repair 7301 (cheap version)
    await Product.findByIdAndUpdate(IDS.inkjet_7301_cheap, {
        images: [IMAGES.inkjet],
        description: "The HP Smart Tank 7301 is a high-capacity ink tank printer that delivers outstanding quality at a low cost. Includes up to 8,000 color or 6,000 black pages of Original HP Ink in the box."
    });

    console.log('Targeted repair completed for the 3 specific products.');
    process.exit();
}

targetedRepair();
