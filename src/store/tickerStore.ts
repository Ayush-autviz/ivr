import {create} from 'zustand';
import { POLYGON_API_KEY } from '../config/polygon';

const useTickerStore = create((set, get) => ({
  tickers: [],
  ivData: [],
  error: null,
  intervalId: null,
  ticker:null,
  stocks:[],
  activeIntervals: {},

  setError: (error)=>{
    set({error})
  },

  setTicker: (ticker)=>{
    set({ticker})
  },


  addStock: async (stock) => {
    console.log(stock,'stockkk')
    set((state) => ({
      stocks: [
        ...state.stocks,
        {
          symbol: stock.symbol,
          tickers: stock.tickers,
          tracking:stock.tracking,
          ivData :[]
        }
      ]
    }));

    // Start tracking all tickers for this stock
    await get().startTrackingStock(stock);
  },


  startTrackingStock: async (stock) => {
    // Stop existing tracking for this stock
    get().stopTrackingStock(stock.symbol);

  //  const tickerSymbols = tickers.map(t => t.details.ticker);

    // Fetch initial data
    await get().fetchOptionsData(stock.tickers,stock.symbol);

    // Set up new interval
    const intervalId = setInterval(() => {
      get().fetchOptionsData(stock.tickers,stock.symbol);
    }, 3000);

    // Store the interval ID
    set((state) => ({
      activeIntervals: {
        ...state.activeIntervals,
        [stock.symbol]: intervalId
      }
    }));
  },


  stopTrackingStock: (stockSymbol) => {
    const { activeIntervals } = get();
  
    if (activeIntervals[stockSymbol]) {
      clearInterval(activeIntervals[stockSymbol]);
    }
  
    set((state) => ({
      // Remove the stock's interval
      activeIntervals: {
        ...state.activeIntervals,
        [stockSymbol]: undefined, // Use `undefined` instead of `null` to signify removal
      },
      // Remove the stock from the stocks array
   //   stocks: state.stocks.filter((stock) => stock.symbol !== stockSymbol),
    }));
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

  fetchOptionsData: async (tickers, symbol) => {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
  
      const response = await fetch(
        `https://api.polygon.io/v3/snapshot?ticker.any_of=${tickers}&apiKey=${POLYGON_API_KEY}`
      );
      const result = await response.json();
  
      if (!result.results || result.results.length === 0) {
        throw new Error('No valid data received');
      }
  
      const validResults = result.results.filter((item) => item.implied_volatility);
  
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
        console.log(state.stocks,'state stocks')
        const stockIndex = state.stocks.findIndex((stock) => stock.symbol === symbol);
        if (stockIndex === -1) {
          throw new Error('Stock not found');
        }
  
        // Update the stock's ivData
        const updatedStocks = [...state.stocks];
        const targetStock = updatedStocks[stockIndex];
        const updatedIvData = [...targetStock.ivData, newPoint];
  
        // Calculate moving averages for the new point
        periods.forEach((period) => {
          const periodNum = parseInt(period, 10);
          if (updatedIvData.length >= periodNum) {
            const slice = updatedIvData.slice(-periodNum);
            const sum = slice.reduce((acc, curr) => acc + parseFloat(curr.averageIV), 0);
            newPoint[`MA${period}`] = (sum / periodNum).toFixed(2);
          } else {
            newPoint[`MA${period}`] = null; // Not enough data points
          }
        });
  
        // Update the stock in the array
        updatedStocks[stockIndex] = {
          ...targetStock,
          ivData: updatedIvData,
        };
  
        return {
          stocks: updatedStocks,
          error: null,
        };
      });
    } catch (err) {
      set({ error: err.message });
    }
  },
  
  

  // clearInterval: () => {
  //   const currentIntervalId = get().intervalId;
  //   if (currentIntervalId) {
  //     clearInterval(currentIntervalId);
  //     set({ intervalId: null });
  //   }
  // },
}));

export default useTickerStore;
