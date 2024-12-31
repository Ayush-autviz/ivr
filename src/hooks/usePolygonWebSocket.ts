import { useEffect, useState } from 'react';
import { POLYGON_API_KEY } from '../config/polygon';

async function fetchOptionDetails(optionId: string) {
  try {
    const response = await fetch(
      `https://api.polygon.io/v3/quotes/options/${optionId}?apiKey=${POLYGON_API_KEY}`
    );
    const data = await response.json();
     console.log(data)
    if (!response.ok || !data.results) {
      throw new Error(data.message || 'Failed to fetch option details');
    }

    return {
      ask: data.results.ask_price,
      bid: data.results.bid_price,
      price: data.results.last_price,
      rho: data.results.greeks.rho,
      vega: data.results.greeks.vega,
      theta: data.results.greeks.theta,
      gamma: data.results.greeks.gamma,
      delta: data.results.greeks.delta,
    };
  } catch (error) {
    console.error('Error fetching option details:', error);
    throw error;
  }
}

async function fetchTopOptions(symbol: string, expiryDate: string, count: number) {
  try {
    const response = await fetch(
      `https://api.polygon.io/v3/reference/options/contracts?underlying_ticker=${symbol}&expiration_date=${expiryDate}&apiKey=${POLYGON_API_KEY}`
    );
    const data = await response.json();

    if (!response.ok || !data.results) {
      throw new Error(data.message || 'Failed to fetch option contracts');
    }

    console.log(data);

    // Separate Call and Put options
    const calls = data.results.filter((contract) => contract.contract_type === 'call');
    const puts = data.results.filter((contract) => contract.type === 'put');

    console.log('cals')

    // Sort by strike price or any other logic (e.g., nearest to current price)
    const sortedCalls = calls.sort((a, b) => a.strike_price - b.strike_price).slice(0, count);
    const sortedPuts = puts.sort((a, b) => a.strike_price - b.strike_price).slice(0, count);
     console.log(calls)
    return { calls: sortedCalls, puts: sortedPuts };
  } catch (error) {
    console.log(error);
    console.error('Error fetching options:', error);
    throw error;
  }
}


export function useOptionChainDetails(symbol: string, expiryDate: string, count: number) {
  const [data, setData] = useState<{ calls: any[]; puts: any[] }>({ calls: [], puts: [] });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!symbol || !expiryDate || count <= 0) return;

    async function fetchOptionChain() {
      setLoading(true);
      try {
        const { calls, puts } = await fetchTopOptions(symbol, expiryDate, count);

        // Fetch details for each call and put option
        const callDetails = await Promise.all(calls.map((call) => fetchOptionDetails(call.ticker)));
        const putDetails = await Promise.all(puts.map((put) => fetchOptionDetails(put.ticker)));

        setData({ calls: callDetails, puts: putDetails });
      } catch (err) {
        console.log(err);
        setError('Failed to fetch option chain details');
      } finally {
        setLoading(false);
      }
    }

    fetchOptionChain();
  }, [symbol, expiryDate, count]);

  return { data, error, loading };
}



