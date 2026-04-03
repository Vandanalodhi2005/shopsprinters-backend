const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');

const IDS = {
    laser_m404dn: '6998b6e60d51a5d80a0c025a', // Wait, check the id for M404dn
    // Correct IDs from check_dups:
    m404dn: '6998b6e60d51a5d80a0c025e',
    o9015e: '6998b6e50d51a5d80a0c023e',
    smart_7301_broken: '6998b6e60d51a5d80a0c025a'
};

// Use a known good Unsplash image for LaserJet
const GOOD_LASER = 'https://images.unsplash.com/photo-1616062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=800';
// Use a different one if that failed
const ALT_LASER = 'https://plus.unsplash.com/premium_photo-1661380845187-89108154625b?auto=format&fit=crop&q=80&w=800';

async function finalClean() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // 1. Delete the broken duplicate 7301
    await Product.findByIdAndDelete(IDS.smart_7301_broken);
    console.log('Deleted broken duplicate for 7301.');

    // 2. Fix the others again with ALT image for Laser
    await Product.findByIdAndUpdate(IDS.m404dn, { 
        images: [ALT_LASER],
        description: "HP LaserJet Pro M404dn Monochrome Laser Printer with auto duplex printing, enterprise-grade security, and fast output for busy workgroups. Prints up to 40 pages per minute."
    });
    
    await Product.findByIdAndUpdate(IDS.o9015e, {
        images: ['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=800'],
        description: "HP OfficeJet Pro 9015e All-in-One Printer. Replaces the OfficeJet Pro 9015. Includes 6 months free ink through HP+ and smart features for small office productivity."
    });

    console.log('Cleaned and fixed remaining products.');
    process.exit();
}

finalClean();
