import axios from 'axios';
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
      `order=asc&`+
      `sort=expiration_date&`+
      `contract_type=call&`+
      `limit=250&` +
      `apiKey=${POLYGON_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch option expiry dates');
    }

    const data = await response.json();
    
    // Extract unique expiry dates and sort them
    const expiryDates = [...new Set(
      data.results?.map((contract: any) => contract.expiration_date) || []
    )].sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).splice(0,5);

    console.log(expiryDates,'expirydates');

    return expiryDates;
  } catch (error) {
    console.error('Error fetching option expiry dates:', error);
    throw error;
  }
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


export const fetchOptionStrikes = async (symbol,expiry,number) => {
  try {
    // Fetch call options
    const callResponse = await axios.get(
      `https://api.polygon.io/v3/snapshot/options/${symbol}?contract_type=call&limit=250&expiration_date=${expiry}&apiKey=${POLYGON_API_KEY}`
    );
    const callData = callResponse.data.results;

    
    const currentPriceCall = callData[callData.length - 1].underlying_asset.price;

    const belowCurrentPriceCall = callData
      .filter((item) => item.details.strike_price <= currentPriceCall)
      .sort((a, b) => b.details.strike_price - a.details.strike_price).slice(0, number/2).reverse();

      const aboveCurrentPriceCall = callData
      .filter((item) => item.details.strike_price >= currentPriceCall) // Filter items
      .sort((a, b) => a.details.strike_price - b.details.strike_price).slice(0, number/2) // Slice the sorted array by the given number
    ; // Reverse the sliced array

    // const uniqueBelowCall = [
    //   ...new Set(
    //     belowCurrentPriceCall.map((item) => item.details.strike_price)
    //   ),
    // ].sort((a, b) => b - a);

    // const uniqueAboveCall = [
    //   ...new Set(
    //     aboveCurrentPriceCall.map((item) => item.details.strike_price)
    //   ),
    // ].sort((a, b) => a - b);

    // const strikesBelowCall = uniqueBelowCall.slice(0, 4);
    // const strikesAboveCall = uniqueAboveCall.slice(0, 4);

    // Fetch put options
    const putResponse = await axios.get(
      `https://api.polygon.io/v3/snapshot/options/${symbol}?contract_type=put&limit=250&expiration_date=${expiry}&apiKey=${POLYGON_API_KEY}`
    );
    const putData = putResponse.data.results;
    const currentPricePut = putData[putData.length - 1].underlying_asset.price;

    const belowCurrentPricePut = putData
      .filter((item) => item.details.strike_price <= currentPricePut)
      .sort((a, b) => b.details.strike_price - a.details.strike_price).slice(0, number/2).reverse();

    const aboveCurrentPricePut = putData
      .filter((item) => item.details.strike_price >= currentPricePut)
      .sort((a, b) => a.details.strike_price - b.details.strike_price).slice(0, number/2);


      console.log(aboveCurrentPriceCall,belowCurrentPricePut);

    // const uniqueBelowPut = [
    //   ...new Set(
    //     belowCurrentPricePut.map((item) => item.details.strike_price)
    //   ),
    // ].sort((a, b) => b - a);

    // const uniqueAbovePut = [
    //   ...new Set(
    //     aboveCurrentPricePut.map((item) => item.details.strike_price)
    //   ),
    // ].sort((a, b) => a - b);

    // const strikesBelowPut = uniqueBelowPut.slice(0, 4);
    // const strikesAbovePut = uniqueAbovePut.slice(0, 4);

    // Return the formatted data
    return {
      currentPriceCall,
      belowCurrentPriceCall,
      aboveCurrentPriceCall,
      currentPricePut,
      belowCurrentPricePut,
      aboveCurrentPricePut,
    };
  } catch (error) {
    console.error("Error fetching option strikes:", error);
    return null;
  }
};
