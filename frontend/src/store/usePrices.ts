import { create } from 'zustand';

interface PriceData {
  price: number;
  change24h: number;
  volume: number;
  timestamp: number;
}

interface PriceState {
  prices: Map<string, PriceData>;
  updatePrice: (symbol: string, data: PriceData) => void;
}

export const usePriceStore = create<PriceState>((set) => ({
  prices: new Map(),
  
  updatePrice: (symbol, data) => {
    set((state) => {
      const newPrices = new Map(state.prices);
      newPrices.set(symbol, data);
      return { prices: newPrices };
    });
  },
}));

