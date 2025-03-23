import { NextResponse } from 'next/server';

/**
 * Initiates the OAuth flow for Shopify
 * Redirects the user to Shopify's authorization page
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop');
    
    if (!shop) {
      console.error('Shopify auth error: Missing shop parameter');
      return NextResponse.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/dashboard?error=missing_shop&message=Shop+name+is+required`);
    }
    
    const shopDomain = shop.includes('.myshopify.com') ? shop : `${shop}.myshopify.com`;
    const clientId = process.env.SHOPIFY_API_KEY;
    
    if (!clientId) {
      console.error('Shopify auth error: Missing API key in environment variables');
      return NextResponse.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/dashboard?error=missing_credentials&message=Server+configuration+error`);
    }
    
    // The redirect_uri should match what's configured in your Shopify app settings
    const redirectUri = process.env.SHOPIFY_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/shopify/callback`;
    
    // Scopes that your app needs (add all required scopes)
    const scopes = 'read_products,write_products,read_orders';
    
    // Generate a random state value to prevent CSRF attacks
    const state = Math.random().toString(36).substring(2, 15);
    
    // In a real app, you'd store this state in a session to verify when the user returns
    
    // Construct the authorization URL
    const authUrl = `https://${shopDomain}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
    
    console.log(`Redirecting to Shopify OAuth: ${authUrl}`);
    
    // Redirect to Shopify's authorization page
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Shopify OAuth error:', error);
    return NextResponse.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/dashboard?error=server_error&message=${encodeURIComponent(error.message)}`);
  }
} 