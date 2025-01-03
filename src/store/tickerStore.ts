import {create} from 'zustand';
import { POLYGON_API_KEY } from '../config/polygon';

const useTickerStore = create((set, get) => ({
  tickers: [],
  ivData: [],
  error: null,
  intervalId: null,

  setError: (error)=>{
    set({error})
  },

  setTickers: async (newTickers) => {
    set({ tickers: newTickers });

    // Clear any existing interval when setting new tickers
    const currentIntervalId = get().intervalId;
    if (currentIntervalId) {
      clearInterval(currentIntervalId);
    }

    // Fetch data immediately
    await get().fetchOptionsData(newTickers);

    // Set up an interval to fetch data every 5 seconds
    const newIntervalId = setInterval(() => {
      get().fetchOptionsData(newTickers);
    }, 3000);

    set({ intervalId: newIntervalId });
  },

  fetchOptionsData: async (tickers) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const tickerString = tickers.join(',');

      const response = await fetch(
        `https://api.polygon.io/v3/snapshot?ticker.any_of=${tickerString}&apiKey=${POLYGON_API_KEY}`
      );
      const result = await response.json();

      if (!result.results || result.results.length === 0) {
        throw new Error('No valid data received');
      }

      const validResults = result.results.filter((item) => 
        item.implied_volatility
      );

      console.log(validResults,'validres')

      if (validResults.length === 0) {
        throw new Error('No valid implied volatility data');
      }

      const averageIV = validResults.reduce((sum, item) => {
        const truncatedIV = Math.floor(item.implied_volatility * 100) / 100; // Keep only two decimals
        return sum + truncatedIV;
      }, 0) / validResults.length;

      console.log((averageIV * 100).toFixed(2),'average');

      set((state) => ({
        ivData: [
          ...state.ivData,
          {
            timestamp,
            averageIV: (averageIV * 100).toFixed(2),
          },
        ],
        error: null,
      }));
    } catch (err) {
      set({ error: err.message });
    }
  },

  clearInterval: () => {
    const currentIntervalId = get().intervalId;
    if (currentIntervalId) {
      clearInterval(currentIntervalId);
      set({ intervalId: null });
    }
  },
}));

export default useTickerStore;
