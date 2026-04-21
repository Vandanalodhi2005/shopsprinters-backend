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
        company: process.env.COMPANY_NAME || 'Shopes Printers',
        street1: process.env.COMPANY_ADDRESS || '123 Business Rd', 
        city: process.env.COMPANY_CITY || 'New York',
        state: process.env.COMPANY_STATE || 'NY',
        zip: process.env.COMPANY_ZIP || '10001',
        country: process.env.COMPANY_COUNTRY || 'US',
        phone: process.env.COMPANY_PHONE || '123-456-7890'
    });

    // Customer Address
    // Note: EasyPost requires a name or company for some carriers.
    const toAddress = await client.Address.create({
        name: shippingAddress.name || 'Valued Customer',
        street1: shippingAddress.address,
        city: shippingAddress.city,
        state: shippingAddress.state || '', 
        zip: shippingAddress.postalCode,
        country: shippingAddress.country || 'US',
        phone: shippingAddress.phone
    });

    // Calculate Weight
    // Assuming 20oz (1.25 lbs) per item as default if no weight property exists
    const totalWeightOz = cartItems.reduce((acc, item) => {
        const itemWeight = item.weight ? parseFloat(item.weight) : 20; 
        return acc + (itemWeight * item.qty);
    }, 0);

    const parcel = await client.Parcel.create({
        weight: totalWeightOz
    });

    try {
        const shipment = await client.Shipment.create({
                to_address: toAddress,
                from_address: fromAddress,
                parcel: parcel
        });

        // Filter rates by carrier name
        const allowedCarriers = ['USPS', 'UPS', 'FedEx', 'Canada Post', 'UPSDAP'];

        let filteredRates = shipment.rates.filter(rate => {
            return allowedCarriers.some(c => rate.carrier && rate.carrier.toLowerCase().includes(c.toLowerCase()));
        });

        // If strict filtering results in 0 rates, return all available rates from EasyPost
        if (filteredRates.length === 0) {
            filteredRates = shipment.rates;
        }

        // Handle case where still no rates
        if (filteredRates.length === 0 && shipment.messages.length > 0) {
            console.error("EasyPost Shipment Messages:", shipment.messages);
            const errors = shipment.messages.filter(m => m.type === 'rate_error').map(m => m.message).join(', ');
            if (errors) {
                res.status(400);
                throw new Error(`Shipping Error: ${errors}`);
            }
        }

        res.json(filteredRates);
    } catch (error) {
        console.error("Shipping Calculation Error:", error);
        res.status(error.status || 500);
        throw new Error(error.message || "Failed to calculate shipping rates.");
    }
});

module.exports = { getShippingRates };
