import { create } from 'zustand'
import { fetchOptionStrikes, fetchOptionExpiryDates, searchStocks } from "../services/polygon";

const useAnalysisStore = create((set, get) => ({
  // States
  ticker: '',
  selectedDate: '',
  date: '',
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

  // Data fetching actions
  fetchOptionData: async () => {
    const { ticker, date, strikeRate } = get();
    
    try {
      const data = await fetchOptionStrikes(ticker, date, strikeRate);
      set({ 
        optionData: data,
        analyseLoading: false,
        analyseError: false
      });
    } catch (error) {
      set({ 
        analyseLoading: false,
        analyseError: 'Failed to fetch option data'
      });
      console.error('Error fetching option data:', error);
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
        expLoading: false 
      });
      return dates;
    } catch (error) {
      set({ expLoading: false });
      console.error('Error fetching expiry dates:', error);
      return [];
    }
  },

  // Reset state
  reset: () => {
    const { stopPolling } = get();
    stopPolling();
    set({
      ticker: '',
      selectedDate: '',
      date: '',
      optionData: null,
      analyseLoading: false,
      analyseError: false,
      pollingInterval: null,
      strikeRate: 12
    });
  }
}));

export default useAnalysisStore;