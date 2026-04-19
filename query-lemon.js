const https = require('https');

const API_KEY = process.env.LEMONSQUEEZY_API_KEY;

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.lemonsqueezy.com',
      path: `/v1${path}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/vnd.api+json',
      },
    };

    https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject).end();
  });
}

async function main() {
  try {
    console.log('🔍 Querying Lemon Squeezy...\n');
    
    const stores = await makeRequest('/stores');
    
    if (!stores.data || stores.data.length === 0) {
      console.log('❌ No stores found');
      return;
    }
    
    const store = stores.data[0];
    console.log(`✅ Store ID: ${store.id}`);
    console.log(`   Name: ${store.attributes.name}`);
    console.log(`   URL: ${store.attributes.url}\n`);
    
    // Get products
    const products = await makeRequest(`/stores/${store.id}/products`);
    console.log(`📦 Products: ${products.data?.length || 0}`);
    
    if (products.data && products.data.length > 0) {
      products.data.forEach((p, i) => {
        console.log(`\n  ${i+1}. ${p.attributes.name}`);
        console.log(`     ID: ${p.id}`);
        console.log(`     Price: ${p.attributes.price}`);
      });
    }
    
    console.log(`\n✅ STORE_ID=${store.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
