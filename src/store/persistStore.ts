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

  fetchStocks: async () => {
    get().setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/stocks`);

      set({
        stocks: res.data,
        error: null,
      });

      get().setLoading(false);
    } catch (error) {
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
  },
  startFetching: async () => {
    const callFunction = get().fetchStocks();

    const internalId = setInterval(() => {
      callFunction();
    }, 3000);
  },

  addStocksToDB: async (stock) => {
    console.log("i am running");
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
