import { NextResponse } from 'next/server';

/**
 * Initiates the Amazon Seller Central OAuth flow
 * Redirects the user to Amazon's authorization page
 */
export async function GET(request) {
  try {
    // Amazon Seller API OAuth configuration
    const clientId = process.env.AMAZON_CLIENT_ID;
    
    if (!clientId) {
      console.error('Amazon OAuth error: Missing AMAZON_CLIENT_ID in environment variables');
      return NextResponse.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/dashboard?error=missing_credentials&message=Server+configuration+error`);
    }
    
    const redirectUri = process.env.AMAZON_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/amazon/callback`;
    
    // Define the scopes needed for seller API access
    const scopes = [
      'sellingpartnerapi::notifications',
      'sellingpartnerapi::sales',
      'sellingpartnerapi::catalog',
      'sellingpartnerapi::listings'
    ].join(' ');
    
    // Generate a random state value to prevent CSRF attacks
    const state = Math.random().toString(36).substring(2, 15);
    // In a real app, you'd store this state in a session to verify when the user returns
    
    // Build the authorization URL
    const authUrl = new URL('https://sellercentral.amazon.com/apps/authorize/consent');
    authUrl.searchParams.append('application_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('version', 'beta');
    authUrl.searchParams.append('scope', scopes);
    
    console.log(`Redirecting to Amazon auth URL: ${authUrl.toString()}`);
    
    // Redirect the user to Amazon's authorization page
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Amazon OAuth error:', error);
    return NextResponse.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/dashboard?error=server_error&message=${encodeURIComponent(error.message)}`);
  }
} 