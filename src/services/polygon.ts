import { POLYGON_API_KEY } from '../config/polygon';

const BASE_URL = 'https://api.polygon.io/v3';

export async function fetchOptionExpiryDates(symbol: string): Promise<string[]> {
  try {
    console.log(symbol,'symbol');
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    const response = await fetch(
      `${BASE_URL}/reference/options/contracts?` + 
      `underlying_ticker=${symbol}&` +
      `expiration_date.gte=${today}&` +
      `limit=10&` +
      `apiKey=${POLYGON_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch option expiry dates');
    }

    const data = await response.json();
    
    // Extract unique expiry dates and sort them
    const expiryDates = [...new Set(
      data.results?.map((contract: any) => contract.expiration_date) || []
    )].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    console.log(expiryDates,'expirydates');

    return expiryDates;
  } catch (error) {
    console.error('Error fetching option expiry dates:', error);
    throw error;
  }
}

// Helper function to fetch all pages of data
async function fetchAllPages(symbol: string, initialUrl: string): Promise<any[]> {
  let results: any[] = [];
  let nextUrl = initialUrl;

  while (nextUrl) {
    const response = await fetch(nextUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch option data');
    }

    const data = await response.json();
    results = results.concat(data.results || []);

    // Check if there are more pages
    nextUrl = data.next_url ? `${data.next_url}&apiKey=${POLYGON_API_KEY}` : null;
  }

  return results;
}


export async function fetchFromPolygon(endpoint: string, params: Record<string, string> = {}) {
  const queryString = new URLSearchParams({
    ...params,
    apiKey: POLYGON_API_KEY
  }).toString();

  const response = await fetch(`${BASE_URL}${endpoint}?${queryString}`);
  
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch from ${endpoint}`);
    } catch {
      throw new Error(`Failed to fetch from ${endpoint}`);
    }
  }

  return response.json();
}


export async function searchStocks(query: string): Promise<Array<{ symbol: string, name: string }>> {
  if (!query) return [];
  
  try {
    const response = await fetchFromPolygon('/reference/tickers', {
      search: query,
      market: 'stocks',
      active: 'true',
      limit: '5'
    });
    
    return response.results?.map((stock: any) => ({
      symbol: stock.ticker,
      name: stock.name
    })) || [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
}