import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMockProductsForKeyword } from '@/lib/amazon-api';
import { fetchMockShopifyProducts } from '@/lib/shopify-api';

export const dynamic = 'force-dynamic';

// Mock function since the import seems to be failing
async function fetchMockAmazonProducts() {
  const mockProducts = [
    {
      id: 'AMZN001',
      title: 'Premium Wireless Headphones',
      price: 129.99,
      currency: 'USD',
      inventory: 42,
      images: [
        'https://images.amazon.com/headphones-black-main.jpg',
        'https://images.amazon.com/headphones-black-side.jpg'
      ],
      status: 'active',
      sku: 'WH-BLK-001',
      sales_last_30_days: 87,
      rating: 4.7,
      platform: 'amazon',
      asin: 'B07XYZ1234'
    },
    {
      id: 'AMZN002',
      title: 'Smart Watch Series 5',
      price: 199.99,
      currency: 'USD',
      inventory: 15,
      images: [
        'https://images.amazon.com/smartwatch-s5-silver.jpg'
      ],
      status: 'active',
      sku: 'SW-S5-SLV',
      sales_last_30_days: 64,
      rating: 4.5,
      platform: 'amazon',
      asin: 'B07ABC5678'
    }
  ];
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return mockProducts;
}

export async function GET(request) {
  console.log("GET /api/products - Request received");
  
  try {
    // Properly await cookies() before using it
    const cookieStore = await cookies();
    
    // Dump all cookies for debugging
    const allCookies = cookieStore.getAll();
    console.log("All cookies:", allCookies.map(c => `${c.name}=${c.value}`));
    
    // Log cookie values for debugging
    const amazonToken = cookieStore.get('amazon_token')?.value;
    const shopifyToken = cookieStore.get('shopify_token')?.value;
    const shopName = cookieStore.get('shop_name')?.value;
    const shopifyConnected = cookieStore.get('shopify_connected')?.value;
    
    console.log("Cookie values:", { 
      amazonToken: amazonToken ? "exists" : "missing", 
      shopifyToken: shopifyToken ? "exists" : "missing",
      shopifyConnected: shopifyConnected ? "exists" : "missing",
      shopName
    });
    
    let products = [];
    
    // Force Shopify products for testing if a specific header is provided
    const forceShopify = request.headers.get('x-force-shopify') === 'true';
    if (forceShopify) {
      console.log("Forcing Shopify products for testing");
      const shopifyProducts = await fetchMockShopifyProducts('pro-photo-studio-test.myshopify.com');
      products = [...products, ...shopifyProducts];
      console.log(`GET /api/products - Returning ${products.length} forced Shopify products`);
      return NextResponse.json({ products });
    }
    
    // Fetch Amazon products if connected
    if (amazonToken) {
      console.log("Fetching Amazon products");
      const amazonProducts = await fetchMockAmazonProducts();
      products = [...products, ...amazonProducts];
    }
    
    // Fetch Shopify products if connected via any method
    if ((shopifyToken && shopName) || shopifyConnected === 'true') {
      // Use the shop name if available, otherwise use a default
      const shopToUse = shopName || 'pro-photo-studio-test.myshopify.com';
      console.log(`Fetching Shopify products for ${shopToUse}`);
      
      const shopifyProducts = await fetchMockShopifyProducts(shopToUse);
      products = [...products, ...shopifyProducts];
    }
    
    console.log(`GET /api/products - Returning ${products.length} products`);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error in /api/products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", message: error.message },
      { status: 500 }
    );
  }
}

// Mock function to fetch Amazon products
async function fetchAmazonProducts() {
  // In production, this would use the Amazon API with the stored token
  // For demo, generate mock data
  const mockData = getMockProductsForKeyword('bestsellers');
  
  // Transform the data to a standard format
  return mockData.products.map(product => ({
    id: product.asin,
    title: product.title,
    description: product.description || 'No description available',
    price: product.price,
    image: product.imageUrl,
    platform: 'Amazon',
    asin: product.asin,
    rating: product.rating,
    reviewCount: product.reviewCount,
    category: 'Electronics' // Mock category
  }));
}

// Mock function to fetch Shopify products
async function fetchShopifyProducts(shop) {
  // In production, this would use the Shopify API with the stored token
  
  // For demo, generate mock data
  const mockProducts = [];
  const productTypes = ['T-Shirt', 'Mug', 'Poster', 'Hoodie', 'Phone Case', 'Sticker', 'Hat', 'Bag'];
  
  for (let i = 1; i <= 8; i++) {
    const id = `shopify_${Math.random().toString(36).substr(2, 9)}`;
    const title = `${productTypes[i-1]} - ${shop}`;
    const price = Math.floor(Math.random() * 50) + 10;
    
    mockProducts.push({
      id,
      title,
      description: `This is a ${productTypes[i-1]} from ${shop}`,
      price,
      image: `https://source.unsplash.com/featured/?${encodeURIComponent(productTypes[i-1])}&sig=${id}`,
      platform: 'Shopify',
      shopifyId: id,
      variants: [
        { id: `variant_${i}_1`, title: 'Small', price },
        { id: `variant_${i}_2`, title: 'Medium', price },
        { id: `variant_${i}_3`, title: 'Large', price }
      ],
      availableForSale: true
    });
  }
  
  return mockProducts;
} 