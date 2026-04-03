async function fetchProducts() {
  try {
    const res = await fetch('http://localhost:5000/api/products');
    const data = await res.json();
    const formatted = data.products.map(p => ({ title: p.title, images: p.images }));
    require('fs').writeFileSync('products_all.json', JSON.stringify(formatted, null, 2));
    console.log('Success!', data.products.length, 'products found.');
  } catch (err) {
    console.error(err);
  }
}
fetchProducts();
