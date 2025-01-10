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
    get().removeStock(stock.symbol);
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
    }, 5000);

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
  removeStock: (stockSymbol) => {
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
     stocks: state.stocks.filter((stock) => stock.symbol !== stockSymbol),
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

      const vegas = validResults.map((item)=>{
        const v = Math.floor(item?.greeks?.vega * 100) / 100;
        return (v * 100).toFixed(2);
      })

      const asks = validResults.map((item)=>{
    
        return item.last_quote.ask;
      })

      const bids = validResults.map((item)=>{
        
        return item.last_quote.bid;
      })

      const thetas = validResults.map((item)=>{
        const t= Math.floor(item?.greeks?.theta * 100) / 100;
        return (t * 100).toFixed(2);
      })

      const averageVega = validResults.reduce((sum, item) => {
        const truncatedIV = Math.floor(item?.greeks?.vega * 100) / 100; // Keep only two decimals
        return sum + truncatedIV;
      }, 0) / validResults.length;

      const averageTheta = validResults.reduce((sum, item) => {
        const truncatedIV = Math.floor(item?.greeks?.theta * 100) / 100; // Keep only two decimals
        return sum + truncatedIV;
      }, 0) / validResults.length;

      const averageBid = validResults.reduce((sum, item) => {
        const truncatedIV = item.last_quote.bid;
        // Keep only two decimals
        return sum + truncatedIV;
      }, 0) / validResults.length;

      const averageAsk = validResults.reduce((sum, item) => {
        const truncatedIV = item.last_quote.ask;
        return sum + truncatedIV;
      }, 0) / validResults.length;
  
      const newPoint = {
        timestamp,
        averageIV: (averageIV * 100).toFixed(2),
        vegas:vegas,
        thetas:thetas,
        asks,
        bids,
        averageVega:(averageVega * 100).toFixed(2),
        averageTheta:(averageTheta * 100).toFixed(2),
        averageAsk,
        averageBid,
        timeframeData: {},
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

        const strikes = [...new Set(validResults.map(item => item.details.strike_price))];

        const timeframes = {
          '1min': 12,    // 12 * 5sec = 1min
          '5min': 60,    // 60 * 5sec = 5min
          '10min': 120,  // 120 * 5sec = 10min
          '15min': 180,  // 180 * 5sec = 15min
          '30min': 360   // 360 * 5sec = 30min
        };
        
        vegas.forEach((_, index) => {
          Object.entries(timeframes).forEach(([timeframe, dataPoints]) => {
            console.log(timeframe,dataPoints,'td');
            if (updatedIvData?.length >= dataPoints) {
              const slice = updatedIvData.slice(-dataPoints);
              
              const startVega = parseFloat(slice[0]?.vegas?.[index]);
              const endVega = parseFloat(slice[slice.length - 1]?.vegas?.[index]);
              
              const startTheta = parseFloat(slice[0]?.thetas?.[index]);
              const endTheta = parseFloat(slice[slice.length - 1]?.thetas?.[index]);
        
              const startBid = slice[0]?.bids?.[index] ;
              const startAsk = slice[0]?.asks?.[index] ;
              const endBid = slice[slice.length - 1]?.bids?.[index] ;
              const endAsk = slice[slice.length - 1]?.asks?.[index] ;
        
              const averageVega = (startVega + endVega) / 2;
              const averageTheta = (startTheta + endTheta) / 2;
        
              const timeframeMinutes = dataPoints * 5 / 60;
              const thetaPriceChange = (averageTheta / 1440) * (timeframeMinutes * 1440);
        
              const startAvgPremiumPrice = startBid + startAsk > 0 
                ? ((startBid + startAsk) / 2 + Math.abs(thetaPriceChange)) 
                : 0;
        
              const currentAvgPremiumPrice = (endBid + endAsk) / 2;
        
              const netPriceChangePercentage = 
                startAvgPremiumPrice !== 0 
                  ? ((currentAvgPremiumPrice / startAvgPremiumPrice - 1) * 100) 
                  : 0;
        
              // if (!newPoint.timeframeData) newPoint.timeframeData = {};
              // if (!newPoint.timeframeData[timeframe]) newPoint.timeframeData[timeframe] = [];
             

              const previousData = updatedIvData[updatedIvData.length-2]?.timeframeData?.[timeframe]?.[index]??null;
              const timeframeSeconds = timeframeMinutes * 60; // Convert timeframe to seconds

              console.log(previousData,'previous data');
              //console.log(timestamp - previousData.time < timeframeSeconds,'updated')
        
              if (previousData && (timestamp - previousData.time < timeframeSeconds)) {
                // Update the existing point
                // previousData.value = parseFloat(netPriceChangePercentage.toFixed(2));
                // previousData.vega = averageVega;
                // previousData.theta = averageTheta;
                // previousData.bid = endBid;
                // previousData.ask = endAsk;
                if (!newPoint.timeframeData[timeframe]) newPoint.timeframeData[timeframe] = [];
                newPoint.timeframeData[timeframe][index] = {
                  time: previousData.time,
                  value: parseFloat(netPriceChangePercentage.toFixed(2)),
                  vega: averageVega,
                  theta: averageTheta,
                  bid: endBid,
                  ask: endAsk
                };
              } else {
                // Insert a new point
                console.log('else condition')
                if (!newPoint.timeframeData[timeframe]) newPoint.timeframeData[timeframe] = [];
                newPoint.timeframeData[timeframe][index] = {
                  time: timestamp,
                  value: parseFloat(netPriceChangePercentage.toFixed(2)),
                  vega: averageVega,
                  theta: averageTheta,
                  bid: endBid,
                  ask: endAsk
                };
              }
        
            }
          });
        });
        
        


  
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
      console.log(err);
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
