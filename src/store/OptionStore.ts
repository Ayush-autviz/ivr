import { create } from "zustand";
import {
  fetchOptionStrikes,
  fetchOptionExpiryDates,
  searchStocks,
} from "../services/polygon";

const useAnalysisStore = create((set, get) => ({
  // States
  ticker: "",
  selectedDate: "",
  date: "",
  optionData: null,
  analyseLoading: false,
  analyseError: false,
  pollingInterval: null,
  strikeRate: 12,

  // Actions
  setTicker: (ticker) => set({ ticker }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setDate: (date) => set({ date }),
  setOptionData: (optionData) => set({ optionData }),
  setAnalyseLoading: (analyseLoading) => set({ analyseLoading }),
  setAnalyseError: (error) => {
    set({ analyseError: error });
    // Clear error after 2 seconds
    setTimeout(() => {
      set({ analyseError: false });
    }, 2000);
  },
  setStrikeRate: (strikeRate) => set({ strikeRate }),

  handleImpliedVolatility: (newData, previousOptionData) => {
    // If it's the first fetch (no previous data), return as is
    if (!previousOptionData) {
      return newData;
    }

    // Deep clone the new data to avoid mutations
    const processedData = JSON.parse(JSON.stringify(newData));

    // Process each category of options
    const categories = [
      "aboveCurrentPriceCall",
      "aboveCurrentPricePut",
      "belowCurrentPriceCall",
      "belowCurrentPricePut",
    ];



    categories.forEach((category) => {
      if (Array.isArray(processedData[category])) {
        processedData[category] = processedData[category].map((newOption) => {
          // Skip if current option has valid IV
      
          if (
            newOption.implied_volatility != null &&
            newOption.implied_volatility !== undefined
          ) {
            return newOption;
          }
        
          // Find matching option in previous data based on strike and contract type
          const matchingPreviousOption = previousOptionData[category]?.find(
            (prevOption) =>
              prevOption.details.strike_price ===
                newOption.details.strike_price &&
              prevOption.details.contract_type ===
                newOption.details.contract_type
          );

          

          // If matching option found and it has valid IV, use it
          if (
            matchingPreviousOption?.implied_volatility != null &&
            matchingPreviousOption?.implied_volatility !== undefined
          ) {
            return {
              ...newOption,
              implied_volatility: matchingPreviousOption.implied_volatility,
            };
          }

          return newOption;
        });
      }
    });

    return processedData;
  },

  // Data fetching actions
  fetchOptionData: async () => {
    const store = get();
    const { ticker, date, strikeRate, optionData: previousOptionData } = store;

    try {
      const data = await fetchOptionStrikes(ticker, date, strikeRate);
      const processedData = store.handleImpliedVolatility(
        data,
        previousOptionData
      );

      set({
        optionData: processedData,
        analyseLoading: false,
        analyseError: false,
      });
    } catch (error) {
      set({
        analyseLoading: false,
        analyseError: "Failed to fetch option data",
      });
      console.error("Error fetching option data:", error);
    }
  },

  startAnalysis: () => {
    const store = get();

    // Validation
    if (!store.ticker) {
      store.setAnalyseError("Please Select Stock");
      return;
    }
    if (!store.date) {
      store.setAnalyseError("Please Select Expiry Date");
      return;
    }

    // Start loading
    set({ analyseLoading: true });

    // Clear any existing interval
    store.stopPolling();

    // Initial fetch
    store.fetchOptionData();

    // Set up new interval
    const intervalId = setInterval(store.fetchOptionData, 5000);
    set({ pollingInterval: intervalId });
  },

  stopPolling: () => {
    const { pollingInterval } = get();
    if (pollingInterval) {
      clearInterval(pollingInterval);
      set({ pollingInterval: null });
    }
  },

  fetchExpiryDates: async (symbol) => {
    try {
      set({ expLoading: true });
      const dates = await fetchOptionExpiryDates(symbol);
      set({
        expiry: dates,
        expLoading: false,
      });
      return dates;
    } catch (error) {
      set({ expLoading: false });
      console.error("Error fetching expiry dates:", error);
      return [];
    }
  },

  // Reset state
  reset: () => {
    const { stopPolling } = get();
    stopPolling();
    set({
      ticker: "",
      selectedDate: "",
      date: "",
      optionData: null,
      analyseLoading: false,
      analyseError: false,
      pollingInterval: null,
      strikeRate: 12,
    });
  },
}));

export default useAnalysisStore;
