import { NextResponse } from 'next/server';

// Function to fetch product details and category from Amazon
async function fetchProductDetails(asin) {
  try {
    // Get Amazon access token using client credentials
    const accessToken = await getAmazonAccessToken();
    
    if (!accessToken) {
      console.warn('Failed to get Amazon access token, falling back to mock data');
      return getFallbackProductData(asin);
    }
    
    // Use the Amazon API with the access token
    const response = await fetch(`https://sandbox.sellingpartnerapi-na.amazon.com/products/v0/items/${asin}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-amz-access-token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`Amazon API returned ${response.status} for ASIN ${asin}, falling back to mock data`);
      return getFallbackProductData(asin);
    }

    const productData = await response.json();
    
    // Transform the API response to match our data structure
    // The actual structure may vary based on Amazon's API
    return {
      asin,
      title: productData.item?.title || productData.itemName || `Product ${asin}`,
      price: extractPrice(productData),
      rating: extractRating(productData),
      reviews: extractReviewCount(productData),
      estimatedSales: Math.floor(Math.random() * 10000) + 500, // Estimated data
      marketShare: Math.floor(Math.random() * 20) + 5, // Estimated data
      categoryId: extractCategoryId(productData),
      categoryName: extractCategoryName(productData),
      keywords: extractKeywords(productData),
      priceHistory: {
        min: extractPrice(productData) * 0.9,
        max: extractPrice(productData) * 1.1
      },
      rankingInfo: extractRankings(productData)
    };
  } catch (error) {
    console.error(`Error fetching product details for ASIN ${asin}:`, error);
    return getFallbackProductData(asin);
  }
}

// Helper function to extract keywords from title
function extractKeywordsFromTitle(title) {
  if (!title) return ["quality", "value", "popular"];
  
  // Remove common words, split by spaces, and keep only words longer than 3 characters
  const commonWords = ['the', 'and', 'for', 'with', 'this', 'that', 'from', 'your', 'have', 'will'];
  return title.toLowerCase()
    .split(/\s+|,|-/)
    .filter(word => word.length > 3 && !commonWords.includes(word))
    .slice(0, 4); // Use up to 4 keywords
}

// Function to get fallback product data when API fails
function getFallbackProductData(asin) {
  // Check if we have a known mock product
  const mockProducts = {
    // Electronics
    'B01DFKC2SO': {
      asin: 'B01DFKC2SO',
      title: "Premium Wireless Headphones",
      price: 199.99,
      rating: 4.7,
      reviews: 3250,
      estimatedSales: 15000,
      marketShare: 22,
      categoryId: "electronics",
      categoryName: "Electronics",
      keywords: ["noise-cancelling", "wireless", "premium", "long-battery"],
      priceHistory: {
        min: 179.99,
        max: 219.99
      },
      rankingInfo: {
        "Electronics": 28,
        "Headphones": 5
      }
    },
    // Home & Kitchen
    'B07X2LSDM3': {
      asin: 'B07X2LSDM3',
      title: "Smart Coffee Maker",
      price: 129.99,
      rating: 4.5,
      reviews: 1820,
      estimatedSales: 9500,
      marketShare: 18,
      categoryId: "home_kitchen",
      categoryName: "Home & Kitchen",
      keywords: ["smart-home", "programmable", "sleek-design", "energy-efficient"],
      priceHistory: {
        min: 119.99,
        max: 149.99
      },
      rankingInfo: {
        "Home & Kitchen": 45,
        "Coffee Makers": 8
      }
    },
    // Sports & Outdoors
    'B083TF7YD9': {
      asin: 'B083TF7YD9',
      title: "Ultralight Camping Tent",
      price: 249.99,
      rating: 4.8,
      reviews: 950,
      estimatedSales: 4500,
      marketShare: 15,
      categoryId: "sports_outdoors",
      categoryName: "Sports & Outdoors",
      keywords: ["lightweight", "waterproof", "easy-setup", "durable"],
      priceHistory: {
        min: 229.99,
        max: 269.99
      },
      rankingInfo: {
        "Sports & Outdoors": 72,
        "Camping Tents": 3
      }
    },
    // Default product (used if ASIN doesn't match any known products)
    'default': {
      asin,
      title: "Sample Product",
      price: 99.99,
      rating: 4.5,
      reviews: 250,
      estimatedSales: 1200,
      marketShare: 15,
      categoryId: "electronics",
      categoryName: "Electronics",
      keywords: ["premium", "reliable", "fast", "innovative"],
      priceHistory: {
        min: 89.99,
        max: 109.99
      },
      rankingInfo: {
        "Electronics": 150,
        "Tech Gadgets": 45
      }
    }
  };

  // Case-insensitive matching for better user experience
  const productKey = Object.keys(mockProducts).find(key => 
    key.toLowerCase() === asin.toLowerCase()
  ) || 'default';
  
  return productKey === 'default' 
    ? {...mockProducts.default, asin} 
    : mockProducts[productKey];
}

// Function to fetch competitors in the same category
async function fetchCompetitors(categoryId, excludeAsin) {
  try {
    // Get Amazon access token
    const accessToken = await getAmazonAccessToken();
    
    if (!accessToken) {
      console.warn('Failed to get Amazon access token, falling back to mock data');
      return getFallbackCompetitors(categoryId);
    }
    
    // Use the Amazon API with the access token to search for category products
    const response = await fetch(`https://sandbox.sellingpartnerapi-na.amazon.com/catalog/v0/items?keywords=${encodeURIComponent(categoryId)}&marketplaceIds=ATVPDKIKX0DER`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'x-amz-access-token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`Amazon API returned ${response.status} for category ${categoryId}, falling back to mock data`);
      return getFallbackCompetitors(categoryId);
    }

    const catalogData = await response.json();
    
    // Filter out the target product and transform the data
    // The actual structure will vary based on Amazon's API
    const competitors = (catalogData.items || [])
      .filter(item => item.asin !== excludeAsin)
      .slice(0, 5) // Limit to 5 competitors
      .map(item => ({
        asin: item.asin,
        title: item.itemName || `Competitor Product`,
        price: extractPrice(item),
        rating: extractRating(item),
        reviews: extractReviewCount(item),
        estimatedSales: Math.floor(Math.random() * 10000) + 500, // Estimated data
        marketShare: Math.floor(Math.random() * 20) + 5, // Estimated data
        keywords: extractKeywords(item),
        priceHistory: {
          min: extractPrice(item) * 0.9,
          max: extractPrice(item) * 1.1
        },
        rankingInfo: extractRankings(item)
      }));
      
    return competitors.length > 0 ? competitors : getFallbackCompetitors(categoryId);
  } catch (error) {
    console.error(`Error fetching competitors for category ${categoryId}:`, error);
    return getFallbackCompetitors(categoryId);
  }
}

// Helper function to get Amazon access token
async function getAmazonAccessToken() {
  try {
    const clientId = process.env.AMAZON_CLIENT_ID || 'amzn1.application-oa2-client.da112be50b614d31996a18af235d2291';
    const clientSecret = process.env.AMAZON_CLIENT_SECRET;
    const refreshToken = process.env.AMAZON_REFRESH_TOKEN;
    
    if (!clientSecret || !refreshToken) {
      console.warn('Missing Amazon API credentials');
      return null;
    }
    
    const response = await fetch('https://api.amazon.com/auth/o2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
      })
    });
    
    if (!response.ok) {
      console.error(`Failed to get Amazon access token: ${response.status}`);
      return null;
    }
    
    const tokenData = await response.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting Amazon access token:', error);
    return null;
  }
}

// Helper functions to extract data from Amazon API responses
function extractPrice(data) {
  try {
    // Try different possible paths for price in the API response
    if (data.price?.amount) return parseFloat(data.price.amount);
    if (data.offers?.[0]?.price?.amount) return parseFloat(data.offers[0].price.amount);
    if (data.attributes?.listPrice?.value) return parseFloat(data.attributes.listPrice.value);
    
    // Default fallback price
    return 99.99;
  } catch (e) {
    return 99.99;
  }
}

function extractRating(data) {
  try {
    // Try different possible paths for rating
    if (data.rating) return parseFloat(data.rating);
    if (data.customerReviews?.starRating) return parseFloat(data.customerReviews.starRating);
    if (data.attributes?.customerReviews?.starRating?.value) {
      return parseFloat(data.attributes.customerReviews.starRating.value);
    }
    
    // Default fallback rating (4.0-4.9)
    return 4.0 + Math.random() * 0.9;
  } catch (e) {
    return 4.5;
  }
}

function extractReviewCount(data) {
  try {
    // Try different possible paths for review count
    if (data.reviewCount) return parseInt(data.reviewCount);
    if (data.customerReviews?.count) return parseInt(data.customerReviews.count);
    if (data.attributes?.customerReviews?.count?.value) {
      return parseInt(data.attributes.customerReviews.count.value);
    }
    
    // Default fallback review count (100-3000)
    return Math.floor(Math.random() * 2900) + 100;
  } catch (e) {
    return 250;
  }
}

function extractCategoryId(data) {
  try {
    // Try different possible paths for category ID
    if (data.browseNodeId) return data.browseNodeId;
    if (data.browseNodes?.[0]?.id) return data.browseNodes[0].id;
    if (data.attributes?.browseClassification?.id) return data.attributes.browseClassification.id;
    
    // Default fallback category
    return "electronics";
  } catch (e) {
    return "electronics";
  }
}

function extractCategoryName(data) {
  try {
    // Try different possible paths for category name
    if (data.browseNodeName) return data.browseNodeName;
    if (data.browseNodes?.[0]?.name) return data.browseNodes[0].name;
    if (data.attributes?.browseClassification?.displayName) {
      return data.attributes.browseClassification.displayName;
    }
    
    // Default fallback category name
    return "Electronics";
  } catch (e) {
    return "Electronics";
  }
}

function extractKeywords(data) {
  try {
    // Try to get keywords from the data
    if (data.keywords) return data.keywords.slice(0, 4);
    if (data.attributes?.keywords?.value) return data.attributes.keywords.value.slice(0, 4);
    
    // Extract from title if available
    if (data.title || data.itemName) {
      return extractKeywordsFromTitle(data.title || data.itemName);
    }
    
    // Default fallback keywords
    return ["quality", "value", "popular", "reliable"];
  } catch (e) {
    return ["quality", "value", "popular", "reliable"];
  }
}

function extractRankings(data) {
  try {
    // Try to extract rankings
    const rankings = {};
    
    if (data.salesRanks) {
      data.salesRanks.forEach(rank => {
        rankings[rank.categoryName] = rank.rank;
      });
      return rankings;
    }
    
    if (data.attributes?.salesRank?.value) {
      const categoryName = extractCategoryName(data);
      rankings[categoryName] = data.attributes.salesRank.value;
      return rankings;
    }
    
    // Default fallback ranking
    const categoryName = extractCategoryName(data);
    rankings[categoryName] = Math.floor(Math.random() * 200) + 1;
    return rankings;
  } catch (e) {
    return { "Electronics": Math.floor(Math.random() * 200) + 1 };
  }
}

// Function to get fallback competitors when API fails
function getFallbackCompetitors(categoryId) {
  // Different competitors based on category
  const categoryCompetitors = {
    'electronics': [
      {
        asin: "B08X7JL3QL",
        title: "Budget Wireless Earbuds",
        price: 79.99,
        rating: 4.2,
        reviews: 2100,
        estimatedSales: 12000,
        marketShare: 8,
        keywords: ["budget-friendly", "wireless", "waterproof"],
        priceHistory: {
          min: 69.99,
          max: 89.99
        },
        rankingInfo: {
          "Electronics": 45,
          "Headphones": 12
        }
      },
      {
        asin: "B07NDFT2NB",
        title: "Premium Over-Ear Headphones",
        price: 249.99,
        rating: 4.8,
        reviews: 3800,
        estimatedSales: 18000,
        marketShare: 25,
        keywords: ["studio-quality", "premium", "noise-cancelling"],
        priceHistory: {
          min: 229.99,
          max: 279.99
        },
        rankingInfo: {
          "Electronics": 22,
          "Headphones": 2
        }
      },
      {
        asin: "B09KL7SV1M",
        title: "Mid-Range Wireless Headset",
        price: 149.99,
        rating: 4.6,
        reviews: 1950,
        estimatedSales: 9800,
        marketShare: 15,
        keywords: ["comfortable", "long-battery", "microphone"],
        priceHistory: {
          min: 129.99,
          max: 159.99
        },
        rankingInfo: {
          "Electronics": 38,
          "Headphones": 8
        }
      }
    ],
    'home_kitchen': [
      {
        asin: "B082VRM1VL",
        title: "Basic Coffee Maker",
        price: 59.99,
        rating: 4.3,
        reviews: 1250,
        estimatedSales: 7500,
        marketShare: 12,
        keywords: ["simple", "reliable", "compact"],
        priceHistory: {
          min: 49.99,
          max: 69.99
        },
        rankingInfo: {
          "Home & Kitchen": 95,
          "Coffee Makers": 15
        }
      },
      {
        asin: "B07PCMTW4Y",
        title: "Premium Espresso Machine",
        price: 299.99,
        rating: 4.7,
        reviews: 950,
        estimatedSales: 4200,
        marketShare: 8,
        keywords: ["espresso", "premium", "italian-design"],
        priceHistory: {
          min: 279.99,
          max: 349.99
        },
        rankingInfo: {
          "Home & Kitchen": 120,
          "Coffee Makers": 5
        }
      },
      {
        asin: "B09STVN7JG",
        title: "Smart Coffee System",
        price: 199.99,
        rating: 4.6,
        reviews: 850,
        estimatedSales: 5100,
        marketShare: 10,
        keywords: ["all-in-one", "app-controlled", "customizable"],
        priceHistory: {
          min: 189.99,
          max: 229.99
        },
        rankingInfo: {
          "Home & Kitchen": 75,
          "Coffee Makers": 3
        }
      }
    ],
    'sports_outdoors': [
      {
        asin: "B07XTLNLCL",
        title: "Budget Camping Tent",
        price: 89.99,
        rating: 4.1,
        reviews: 780,
        estimatedSales: 3800,
        marketShare: 12,
        keywords: ["affordable", "basic", "starter"],
        priceHistory: {
          min: 79.99,
          max: 99.99
        },
        rankingInfo: {
          "Sports & Outdoors": 150,
          "Camping Tents": 18
        }
      },
      {
        asin: "B08LTRD3VJ",
        title: "Family Size Camping Tent",
        price: 329.99,
        rating: 4.5,
        reviews: 620,
        estimatedSales: 2500,
        marketShare: 8,
        keywords: ["family-size", "weatherproof", "spacious"],
        priceHistory: {
          min: 299.99,
          max: 349.99
        },
        rankingInfo: {
          "Sports & Outdoors": 95,
          "Camping Tents": 5
        }
      },
      {
        asin: "B09HGYSVTS",
        title: "Premium Backpacking Tent",
        price: 279.99,
        rating: 4.9,
        reviews: 450,
        estimatedSales: 2200,
        marketShare: 7,
        keywords: ["ultralight", "professional", "expedition"],
        priceHistory: {
          min: 259.99,
          max: 299.99
        },
        rankingInfo: {
          "Sports & Outdoors": 110,
          "Camping Tents": 4
        }
      }
    ],
    // Default competitors
    'default': [
      {
        asin: "B0123COMP1",
        title: "Competitor Product 1",
        price: 89.99,
        rating: 4.3,
        reviews: 180,
        estimatedSales: 800,
        marketShare: 12,
        keywords: ["budget-friendly", "reliable", "basic"],
        priceHistory: {
          min: 79.99,
          max: 99.99
        },
        rankingInfo: {
          "Electronics": 180,
          "Tech Gadgets": 55
        }
      },
      {
        asin: "B0123COMP2",
        title: "Competitor Product 2",
        price: 109.99,
        rating: 4.7,
        reviews: 320,
        estimatedSales: 1500,
        marketShare: 18,
        keywords: ["premium", "advanced", "professional"],
        priceHistory: {
          min: 99.99,
          max: 119.99
        },
        rankingInfo: {
          "Electronics": 120,
          "Tech Gadgets": 35
        }
      },
      {
        asin: "B0123COMP3",
        title: "Competitor Product 3",
        price: 94.99,
        rating: 4.4,
        reviews: 210,
        estimatedSales: 950,
        marketShare: 14,
        keywords: ["mid-range", "quality", "value"],
        priceHistory: {
          min: 84.99,
          max: 104.99
        },
        rankingInfo: {
          "Electronics": 165,
          "Tech Gadgets": 50
        }
      }
    ]
  };

  return categoryCompetitors[categoryId] || categoryCompetitors.default;
}

// Function to call DeepSeek API for analysis
async function analyzeWithDeepSeek(data) {
  try {
    // If no API key is set, return mock insights
    if (!process.env.DEEPSEEK_API_KEY) {
      return generateMockInsights(data);
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-r1",
        messages: [
          {
            role: "system",
            content: `You are an expert in e-commerce competitive analysis. Analyze the provided market data for products in the ${data.category} category and generate detailed strategic insights.`
          },
          {
            role: "user",
            content: `Analyze this ${data.category} market data and provide strategic insights: ${JSON.stringify(data)}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      return generateMockInsights(data);
    }

    const result = await response.json();
    return result.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API Error:', error);
    return generateMockInsights(data);
  }
}

// Function to generate mock insights when API is unavailable
function generateMockInsights(data) {
  const { targetProduct, competitors, marketInsights } = data;
  
  return `Based on the analysis of your product in the ${data.category} category:

1. Market Position:
   - Your product is positioned in the mid-to-premium segment
   - Price point of $${targetProduct.price} is competitive within the market range
   - Current market share of ${targetProduct.marketShare}% indicates strong presence

2. Competitive Analysis:
   - Strong rating of ${targetProduct.rating}/5 compared to category average of ${marketInsights.averageRating.toFixed(1)}
   - ${targetProduct.reviews} customer reviews show good market validation
   - Key differentiators: ${targetProduct.keywords.join(', ')}

3. Recommendations:
   - Consider price optimization within ${marketInsights.priceRange.min}-${marketInsights.priceRange.max} range
   - Focus on keywords: ${marketInsights.topKeywords.slice(0,3).join(', ')}
   - Potential to increase market share through targeted marketing

4. Growth Opportunities:
   - Expand product visibility in ${data.category} category
   - Leverage positive ratings for marketing
   - Focus on competitive advantages in ${targetProduct.keywords[0]} and ${targetProduct.keywords[1]}

5. Action Items:
   - Monitor competitor pricing strategies
   - Enhance product listings with top-performing keywords
   - Focus on maintaining high customer satisfaction`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { asin, marketplace = 'amazon.com' } = body;

    // Validate ASIN
    if (!asin) {
      return NextResponse.json({ error: 'ASIN is required' }, { status: 400 });
    }

    // Normalize ASIN (uppercase)
    const normalizedAsin = asin.trim().toUpperCase();

    // Validate ASIN format
    if (!normalizedAsin.match(/^[A-Z0-9]{9,10}$/)) {
      return NextResponse.json(
        { error: 'Invalid ASIN format. ASINs are 10 character alphanumeric identifiers.' }, 
        { status: 400 }
      );
    }

    // 1. Fetch target product details including category
    const productDetails = await fetchProductDetails(normalizedAsin);
    const { categoryId, categoryName } = productDetails;

    // 2. Fetch top competitors in the same category
    const competitors = await fetchCompetitors(categoryId, normalizedAsin);

    // 3. Organize market data
    const marketData = {
      category: categoryName,
      targetProduct: {
        asin,
        ...productDetails
      },
      competitors: competitors.slice(0, 5), // Top 5 competitors
      marketInsights: {
        totalMarketSize: competitors.reduce((sum, comp) => sum + comp.estimatedSales, 0),
        averagePrice: competitors.reduce((sum, comp) => sum + comp.price, 0) / competitors.length,
        averageRating: competitors.reduce((sum, comp) => sum + comp.rating, 0) / competitors.length,
        priceRange: {
          min: Math.min(...competitors.map(comp => comp.price)),
          max: Math.max(...competitors.map(comp => comp.price))
        },
        topKeywords: extractTopKeywords(competitors)
      }
    };

    // 4. Get AI analysis from DeepSeek
    const aiInsights = await analyzeWithDeepSeek(marketData);

    // 5. Return comprehensive response
    const response = {
      ...marketData,
      aiInsights,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in benchmarking API:', error);
    return NextResponse.json(
      { error: 'Failed to process benchmarking request' },
      { status: 500 }
    );
  }
}

// Helper function to extract and rank keywords
function extractTopKeywords(competitors) {
  const keywordCount = {};
  competitors.forEach(comp => {
    comp.keywords.forEach(keyword => {
      keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
    });
  });
  
  return Object.entries(keywordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([keyword]) => keyword);
} 