import axios from "axios";
import { create } from "zustand";

const usePersistStore = create((set, get) => ({
  stocks: [],
  error: null,
  internalId: "",

  fetchStocks: async () => {
    try {
      const res = await axios.get(
        "https://k9fs42gk-3000.inc1.devtunnels.ms/api/stocks"
      );

      set({
        stocks: res.data,
        error: null,
      });
    } catch (error) {
      set({
        error: error,
      });
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
      await axios.post("https://k9fs42gk-3000.inc1.devtunnels.ms/api/stocks", {
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
