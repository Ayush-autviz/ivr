import axios from "axios";
import { create } from "zustand";
import { BASE_URL } from "../constants";

const usePersistStore = create((set, get) => ({
  stocks: [],
  error: null,
  internalId: "",
  loading: false,

  setError: (error) => {
    set({ error });
  },
  setLoading: (loading) => {
    set({ loading });
  },

  sortStockData: (stock) => {
    return {
      ...stock,
      ivData: [...stock.combinedIVData].sort(
        (a, b) => a.timestamp - b.timestamp
      ),
    };
  },

  // Main sorting function for all stocks
  sortAllStocksData: (stocks) => {
    return stocks.map((stock) => get().sortStockData(stock));
  },

  fetchStocks: async () => {
    get().setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/stocks`);

      const sorted = get().sortAllStocksData(res.data);

      set({
        stocks: sorted,
        error: null,
      });

      get().setLoading(false);
    } catch (error) {
      get().setLoading(false);
      set({
        error: error,
      });
    }
  },
  removeStock: async (stockSymbol) => {
    set((state) => ({
      // Remove the stock's interval

      // Remove the stock from the stocks array
      stocks: state.stocks.filter((stock) => stock.symbol !== stockSymbol),
    }));
    try {
      await axios.delete(`${BASE_URL}/api/stocks/${stockSymbol}`);
    } catch (error) {
      console.log(error);
    }

    setTimeout(async () => {
      try {
        await axios.delete(`${BASE_URL}/api/stocks/${stockSymbol}`);
      } catch (error) {
        console.log(error);
      }
    }, 5000);

    setTimeout(async () => {
      try {
        await axios.delete(`${BASE_URL}/api/stocks/${stockSymbol}`);
      } catch (error) {
        console.log(error);
      }
    }, 10000);
  },
  startFetching: async () => {
    const callFunction = get().fetchStocks();

    const internalId = setInterval(() => {
      callFunction();
    }, 3000);
  },

  addStocksToDB: async (stock) => {
    try {
      await axios.post(`${BASE_URL}/api/stocks`, {
        symbol: stock.symbol,

        tickers: stock.tickers,
        tracking: stock.tracking,
      });

      get().fetchStocks();
    } catch (error) {
      set({
        error: error,
      });
    }
  },
}));

export default usePersistStore;
