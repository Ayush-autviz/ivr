import {create} from 'zustand';
import { POLYGON_API_KEY } from '../config/polygon';

const useTickerStore = create((set, get) => ({
  tickers: [],
  ivData: [],
  error: null,
  intervalId: null,
  ticker:null,

  setError: (error)=>{
    set({error})
  },

  setTicker: (ticker)=>{
    set({ticker})
  },

  setTickers: async (newTickers) => {
    set({ tickers: newTickers });

    const arrTickers = newTickers.map((row)=>{
      return row.details.ticker;
    })

    console.log(arrTickers,'arrtickers');

    // Clear any existing interval when setting new tickers
    const currentIntervalId = get().intervalId;
    if (currentIntervalId) {
      clearInterval(currentIntervalId);
    }
    
    set({ivData:[]});

    // Fetch data immediately
    await get().fetchOptionsData(arrTickers);

    // Set up an interval to fetch data every 5 seconds
    const newIntervalId = setInterval(() => {
      get().fetchOptionsData(arrTickers);
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
  
      if (validResults.length === 0) {
        throw new Error('No valid implied volatility data');
      }
  
      const averageIV = validResults.reduce((sum, item) => {
        const truncatedIV = Math.floor(item.implied_volatility * 100) / 100; // Keep only two decimals
        return sum + truncatedIV;
      }, 0) / validResults.length;
  
      const newPoint = {
        timestamp,
        averageIV: (averageIV * 100).toFixed(2),
      };
  
      // Add SMA and LMA calculations
      const smaOptions = ['5', '10', '20', '30', '40'];
      const lmaOptions = ['50', '60', '75', '90', '120', '150'];
      const periods = [...smaOptions, ...lmaOptions];
  
      set((state) => {
        const updatedData = [...state.ivData, newPoint];
        
        // Calculate moving averages for the new point
        periods.forEach((period) => {
          const periodNum = parseInt(period, 10);
          if (updatedData.length >= periodNum) {
            const slice = updatedData.slice(-periodNum);
            const sum = slice.reduce((acc, curr) => acc + parseFloat(curr.averageIV), 0);
            newPoint[`MA${period}`] = (sum / periodNum).toFixed(2);
          } else {
            newPoint[`MA${period}`] = null; // Not enough data points
          }
        });
  
        return {
          ivData: [...updatedData],
          error: null,
        };
      });
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
