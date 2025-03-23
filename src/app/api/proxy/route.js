import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * Shopify App Proxy Handler
 * This endpoint handles requests from the Shopify App Proxy
 * It verifies the request signature and processes the request
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get the query parameters
    const shop = searchParams.get('shop');
    const timestamp = searchParams.get('timestamp');
    const signature = searchParams.get('signature');
    
    // Verify the request is from Shopify
    const isValid = verifyShopifyRequest(searchParams);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }
    
    // Process the request based on the path
    const path = searchParams.get('path') || '';
    
    // Example: Return different data based on the path
    if (path.includes('products')) {
      return NextResponse.json({
        success: true,
        data: {
          products: [
            { id: 1, title: 'Product 1', status: 'Active' },
            { id: 2, title: 'Product 2', status: 'Draft' }
          ]
        }
      });
    } else if (path.includes('analytics')) {
      return NextResponse.json({
        success: true,
        data: {
          totalSales: 12500,
          conversionRate: '3.2%',
          topProducts: [
            { id: 1, title: 'Product 1', sales: 450 },
            { id: 2, title: 'Product 2', sales: 320 }
          ]
        }
      });
    }
    
    // Default response
    return NextResponse.json({
      success: true,
      message: 'Shopify App Proxy is working',
      shop,
      timestamp
    });
    
  } catch (error) {
    console.error('App Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Verify the request is from Shopify
    const isValid = verifyShopifyRequest(searchParams);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }
    
    // Get the request body
    const body = await request.json();
    
    // Process the POST request
    return NextResponse.json({
      success: true,
      message: 'Data received successfully',
      data: body
    });
    
  } catch (error) {
    console.error('App Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * Verify that the request is coming from Shopify
 * @param {URLSearchParams} params - The request query parameters
 * @returns {boolean} - Whether the request is valid
 */
function verifyShopifyRequest(params) {
  // In production, you would get this from environment variables
  const shopifyApiSecret = process.env.SHOPIFY_API_SECRET || 'your_shopify_api_secret';
  
  // Get the signature from the query parameters
  const signature = params.get('signature');
  if (!signature) return false;
  
  // Create a new params object without the signature
  const paramsToVerify = new URLSearchParams();
  params.forEach((value, key) => {
    if (key !== 'signature') {
      paramsToVerify.append(key, value);
    }
  });
  
  // Sort the parameters alphabetically
  const sortedParams = new URLSearchParams([...paramsToVerify.entries()].sort());
  
  // Create a string of key=value pairs
  const queryString = sortedParams.toString();
  
  // Create the HMAC hash
  const hmac = crypto.createHmac('sha256', shopifyApiSecret)
    .update(queryString)
    .digest('hex');
  
  // Compare the calculated signature with the provided signature
  return hmac === signature;
} 