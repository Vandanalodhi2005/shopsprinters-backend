const http = require('http');

const testUrl = 'http://localhost:5000/api/products?category=Laser%20Printers';

console.log(`Testing URL: ${testUrl}`);

http.get(testUrl, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        console.log('Response Status:', resp.statusCode);
        try {
            const json = JSON.parse(data);
            console.log('Products found:', json.products ? json.products.length : 0);
            if (json.products && json.products.length > 0) {
                console.log('First product:', json.products[0].title);
            } else {
                console.log('Full response:', data);
            }
        } catch (e) {
            console.log('Error parsing JSON:', e.message);
            console.log('Raw data:', data);
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});
