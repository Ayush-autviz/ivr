import axios from "axios";
import { create } from "zustand";

const usePersistStore = create((set, get) => ({
  stocks: ["hewllo"],
  error: null,
  internalId: "",

  fetchStocks: async () => {
    try {
      const res = await axios.get("https/sddfdfdfkjf.kp");

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

  addStocksToDB: async (data) => {
    try {
      axios.post("http", {
        symbol: stock.symbol,

        tickers: stock.tickers,
        tracking: stock.tracking,
      });
    } catch (error) {
      set({
        error: error,
      });
    }
  },
}));

export default usePersistStore;
