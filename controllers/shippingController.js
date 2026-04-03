const EasyPostClient = require('@easypost/api');
const asyncHandler = require('express-async-handler');

let client;
try {
  // Initialize only if key is present to avoid crashing if env var is missing during dev
  if (process.env.EASYPOST_API_KEY) {
    client = new EasyPostClient(process.env.EASYPOST_API_KEY);
  }
} catch (e) {
  console.error("EasyPost init failed:", e);
}

// @desc    Calculate shipping rates
// @route   POST /api/shipping/rates
// @access  Private/Public
const getShippingRates = asyncHandler(async (req, res) => {
    if (!client) {
         res.status(503);
         throw new Error('Shipping service not configured (API Key missing)');
    }

    const { shippingAddress, cartItems } = req.body;

    if (!shippingAddress || !cartItems || cartItems.length === 0) {
        res.status(400);
        throw new Error('Missing shipping address or cart items');
    }

    // Default Company Address (Modify as needed)
    const fromAddress = await client.Address.create({
        company: process.env.COMPANY_NAME || 'PrintsCarts',
        street1: process.env.COMPANY_ADDRESS || '123 Business Rd', 
        city: process.env.COMPANY_CITY || 'New York',
        state: process.env.COMPANY_STATE || 'NY',
        zip: process.env.COMPANY_ZIP || '10001',
        country: process.env.COMPANY_COUNTRY || 'US',
        phone: process.env.COMPANY_PHONE || '123-456-7890'
    });

    // Customer Address
    // Note: If state is missing, EasyPost might infer it from Zip but better to have it.
    const toAddress = await client.Address.create({
        street1: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state || '', 
        zip: shippingAddress.postalCode,
        country: shippingAddress.country || 'US',
        phone: shippingAddress.phone
    });

    // Calculate Weight
    // Assuming 20oz (1.25 lbs) per item as default if no weight property exists
    // EasyPost expects weight in ounces
    const totalWeightOz = cartItems.reduce((acc, item) => {
        const itemWeight = item.weight ? parseFloat(item.weight) : 20; 
        return acc + (itemWeight * item.qty);
    }, 0);

    const parcel = await client.Parcel.create({
        weight: totalWeightOz
    });

        const shipment = await client.Shipment.create({
                to_address: toAddress,
                from_address: fromAddress,
                parcel: parcel
        });

        // Filter rates to only show the 4 specified accounts
        const allowedAccounts = [
            'ca_e3cbd16a6eb84914985d90875a6ec074', // Canada Post
            'ca_76d0939dc1ce4c99870bbc2844d8d02b', // FedEx
            'ca_c5f03a14c10d4fbab837e8a35b01c7df', // UPS
            'ca_b82a2962176446d09a48bc649977f467'  // USPS
        ];

        // UPSDAP account: 1399VH (not an EasyPost account ID, but may be in carrier_account_id or carrier)
        // If UPSDAP is a carrier, include it by carrier name
        const filteredRates = shipment.rates.filter(rate => {
            // Some rates have carrier_account_id, some may have carrier
            return (
                allowedAccounts.includes(rate.carrier_account_id) ||
                (rate.carrier === 'UPSDAP' || rate.carrier_account_id === '1399VH')
            );
        });

        res.json(filteredRates);
});

module.exports = { getShippingRates };
