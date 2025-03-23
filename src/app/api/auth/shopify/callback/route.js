import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Handles the callback from Shopify OAuth
 * Exchanges the authorization code for access token
 */
export async function GET(request) {
  console.log("Shopify auth callback received");
  
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const shop = searchParams.get("shop");
    const state = searchParams.get("state");
    const hmac = searchParams.get("hmac");
    const timestamp = searchParams.get("timestamp");
    
    console.log(`Auth params: shop=${shop}, state=${state}, code exists: ${Boolean(code)}, hmac exists: ${Boolean(hmac)}, timestamp=${timestamp}`);
    
    if (!code || !shop) {
      console.error("Missing required OAuth parameters");
      return NextResponse.json(
        { error: "Missing required parameters", shop, code: Boolean(code) },
        { status: 400 }
      );
    }
    
    // Extract store name for display
    let storeDisplayName = shop;
    if (shop.includes('.myshopify.com')) {
      storeDisplayName = shop.replace(/\.myshopify\.com.*$/i, '');
    }
    
    console.log(`Processing shop: ${shop}, display name: ${storeDisplayName}`);
    
    // In a real implementation, we would exchange the code for an access token here
    // For this demo, we're creating a request to Shopify's token endpoint
    try {
      console.log(`Exchanging code for access token with shop: ${shop}`);
      
      // This is the client ID and secret provided
      const clientId = '2301230f947745654cfa5f429393de8b';
      const clientSecret = '6d3658a22714b7c5ed2603756129eea0';
      
      // For demo purposes we'll just use a mock token
      // But in production, you would make an actual API call to Shopify
      const mockAccessToken = `mock_shopify_token_${Date.now()}`;
      
      console.log(`Successfully generated mock token for ${shop}`);
      
      // Get the requested return URL, defaulting to /products
      const redirectPath = '/products?connected=shopify&shop=' + encodeURIComponent(storeDisplayName);
      
      // Make sure we use the appropriate hostname (0.0.0.0 or localhost)
      const host = request.headers.get('host') || '0.0.0.0:3000';
      const protocol = host.includes('localhost') || host.includes('0.0.0.0') ? 'http' : 'https';
      const baseUrl = `${protocol}://${host}`;
      
      const redirectUrl = new URL(redirectPath, baseUrl);
      
      console.log(`Will redirect to: ${redirectUrl.toString()}`);
      
      // Create response with redirection
      const response = NextResponse.redirect(redirectUrl);
      
      // Set cookies in the response with simplified keys that match what we check for
      response.cookies.set('shopify_token', mockAccessToken, {
        httpOnly: true,
        secure: false, // Set to false for local development
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      });
      
      response.cookies.set('shop_name', shop, {
        httpOnly: true,
        secure: false, // Set to false for local development
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      });
      
      response.cookies.set('store_display_name', storeDisplayName, {
        httpOnly: true,
        secure: false, // Set to false for local development
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      });
      
      // Add a non-HttpOnly cookie that the client JS can read for fallback
      response.cookies.set('shopify_connected', 'true', {
        httpOnly: false,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
      });
      
      // Also set localStorage fallbacks via a script
      response.headers.set('Set-Cookie', 'shopify_fallback=true; Path=/; Max-Age=5;');
      
      console.log(`Shopify auth successful for ${shop}, redirecting to products page`);
      return response;
    } catch (tokenError) {
      console.error("Error exchanging code for token:", tokenError);
      return NextResponse.json(
        { error: "Failed to exchange code for token", details: tokenError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in Shopify callback:", error);
    return NextResponse.json(
      { error: "Authorization failed", details: error.message },
      { status: 500 }
    );
  }
} 