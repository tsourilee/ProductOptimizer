import { NextResponse } from 'next/server';

/**
 * Shop Data Erasure Webhook Handler
 * Processes GDPR data deletion requests from Shopify for shop data
 */
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Log the shop erasure request
    console.log('Shop Data Erasure request received:', data);
    
    // In a real implementation:
    // 1. Verify the webhook is from Shopify using HMAC validation
    // 2. Identify all shop/merchant data across your systems
    // 3. Permanently delete or anonymize the data
    // 4. Document the completion of the erasure request

    // For demo purposes, just acknowledge receipt
    return NextResponse.json({ 
      success: true, 
      message: 'Shop data erasure request received and being processed' 
    }, { status: 200 });
  } catch (error) {
    console.error('Error processing shop data erasure:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process shop data erasure request' 
    }, { status: 500 });
  }
} 