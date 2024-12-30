export interface StockOption {
  strike: number;
  expiry: string;
  type: 'call' | 'put';
  lastPrice: number;
  volume: number;
  openInterest: number;
  bid: number;
  ask: number;
}

export interface StockData {
  price: number;
  timestamp: number;
}

export interface OptionChainData {
  calls: StockOption[];
  puts: StockOption[];
}