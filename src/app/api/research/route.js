import { NextResponse } from 'next/server';
import AmazonAPI, { getMockProductsForKeyword, getMockProductByASIN } from '@/lib/amazon-api';

/**
 * Product Research API
 * Handles requests for product research and analysis
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('term');
  const searchType = searchParams.get('type') || 'keyword';
  const useMockData = searchParams.get('mock') === 'true';

  if (!searchTerm) {
    return NextResponse.json(
      { error: 'Search term is required' },
      { status: 400 }
    );
  }

  try {
    let result;
    
    // Only use mock data if explicitly requested
    if (useMockData) {
      console.log('Using mock data for research API (explicitly requested)');
      if (searchType === 'asin') {
        result = getMockProductByASIN(searchTerm);
      } else if (searchType === 'store') {
        result = getMockProductsForKeyword(`Store: ${searchTerm}`);
      } else {
        result = getMockProductsForKeyword(searchTerm);
      }
      
      return NextResponse.json({
        ...result,
        _source: 'mock'
      });
    }
    
    // Try to use real Amazon API
    try {
      console.log('Attempting to use real Amazon API');
      const amazonAPI = new AmazonAPI(
        process.env.AMAZON_CLIENT_ID, 
        process.env.AMAZON_CLIENT_SECRET, 
        process.env.AMAZON_REFRESH_TOKEN,
        process.env.AMAZON_MARKETPLACE_ID
      );
      
      if (searchType === 'asin') {
        result = await amazonAPI.getProductByASIN(searchTerm);
      } else if (searchType === 'store') {
        result = await amazonAPI.searchByStore(searchTerm);
      } else {
        result = await amazonAPI.searchProducts(searchTerm);
      }
      
      console.log('Successfully retrieved real data from Amazon API');
      return NextResponse.json({
        ...result,
        _source: 'amazon_api'
      });
    } catch (apiError) {
      console.error('Amazon API error:', apiError);
      
      // Only fall back to mock data in development or if API credentials are missing
      if (process.env.NODE_ENV === 'development') {
        console.log('Falling back to mock data in development mode');
        try {
          if (searchType === 'asin') {
            result = getMockProductByASIN(searchTerm);
          } else if (searchType === 'store') {
            result = getMockProductsForKeyword(`Store: ${searchTerm}`);
          } else {
            result = getMockProductsForKeyword(searchTerm);
          }
          
          return NextResponse.json({
            ...result,
            _source: 'mock',
            _notice: 'Using mock data due to API error'
          });
        } catch (mockError) {
          console.error('Error generating mock data:', mockError);
          return NextResponse.json(
            { 
              error: 'Error generating mock data', 
              details: mockError.message 
            },
            { status: 500 }
          );
        }
      }
      
      // In production, just return the error
      return NextResponse.json(
        { 
          error: 'Error connecting to Amazon API', 
          details: apiError.message,
          message: 'Please check your Amazon API credentials in .env.local file' 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Product research error:', error);
    return NextResponse.json(
      { error: 'Error retrieving product data', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

/**
 * Get detailed product data by ASIN
 */
async function getProductByASIN(asin) {
  try {
    // In a real app, this would make API calls to Amazon
    // const amazonAPI = new AmazonAPI(process.env.AMAZON_CLIENT_ID, process.env.AMAZON_SECRET_KEY, process.env.AMAZON_REFRESH_TOKEN);
    // const productData = await amazonAPI.getProductByASIN(asin);
    
    // For demo purposes, generate mock data
    const productData = getMockProductByASIN(asin);
    
    return productData;
  } catch (error) {
    console.error('Error fetching product by ASIN:', error);
    throw error;
  }
}

/**
 * Search for products by keyword
 */
async function searchByKeyword(keyword) {
  try {
    // In a real app, this would make API calls to Amazon
    // const amazonAPI = new AmazonAPI(process.env.AMAZON_CLIENT_ID, process.env.AMAZON_SECRET_KEY, process.env.AMAZON_REFRESH_TOKEN);
    // const searchResults = await amazonAPI.searchProducts(keyword);
    
    // For demo purposes, generate mock data
    const searchResults = getMockProductsForKeyword(keyword);
    
    return searchResults;
  } catch (error) {
    console.error('Error searching by keyword:', error);
    throw error;
  }
}

/**
 * Search for products by store name or URL
 */
async function searchByStore(store) {
  try {
    // In a real app, this would make API calls to Amazon
    // const amazonAPI = new AmazonAPI(process.env.AMAZON_CLIENT_ID, process.env.AMAZON_SECRET_KEY, process.env.AMAZON_REFRESH_TOKEN);
    // const searchResults = await amazonAPI.searchByStore(store);
    
    // For demo purposes, return mock data
    const searchResults = getMockProductsForKeyword(`Store: ${store}`);
    
    return searchResults;
  } catch (error) {
    console.error('Error searching by store:', error);
    throw error;
  }
} 