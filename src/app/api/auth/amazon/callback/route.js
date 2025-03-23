import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Handles the callback from Amazon Seller Central OAuth
 * Exchanges the authorization code for access and refresh tokens
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const authorizationCode = searchParams.get('spapi_oauth_code');
  const state = searchParams.get('state');
  
  // Validate state to prevent CSRF attacks (in production, validate against session)
  
  if (!authorizationCode) {
    console.error('Amazon callback error: Missing authorization code');
    return NextResponse.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/dashboard?error=auth_failed&message=Missing+authorization+code`);
  }
  
  try {
    // Exchange authorization code for tokens
    const clientId = process.env.AMAZON_CLIENT_ID;
    const clientSecret = process.env.AMAZON_CLIENT_SECRET;
    const redirectUri = process.env.AMAZON_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:3000'}/api/auth/amazon/callback`;
    
    if (!clientId || !clientSecret) {
      console.error('Amazon callback error: Missing API credentials in environment variables');
      return NextResponse.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/dashboard?error=missing_credentials&message=Server+configuration+error`);
    }
    
    console.log('Exchanging code for Amazon access token');
    
    const tokenResponse = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authorizationCode,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri
      })
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Amazon token exchange failed:', errorText);
      return NextResponse.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/dashboard?error=token_exchange_failed&message=Failed+to+exchange+token`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log('Successfully obtained Amazon access token');
    
    // For demonstration only - in production, store tokens securely
    // e.g., encrypted in a database associated with the user's session
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    };
    
    // Store tokens in cookies (encrypt in production!)
    cookies().set('amazon_access_token', tokenData.access_token, cookieOptions);
    cookies().set('amazon_refresh_token', tokenData.refresh_token, cookieOptions);
    
    // Redirect back to dashboard
    return NextResponse.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/dashboard?connected=amazon`);
  } catch (error) {
    console.error('Amazon OAuth callback error:', error);
    return NextResponse.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/dashboard?error=server_error&message=${encodeURIComponent(error.message)}`);
  }
} 