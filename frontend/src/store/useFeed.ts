import { create } from 'zustand';
import { API_BASE_URL } from '../config';

export interface Signal {
  symbol: string;
  mode: 'scalp' | 'intraday' | 'swing';
  action: 'BUY' | 'SELL' | 'HOLD';
  entry: number;
  tp: number;
  sl: number;
  regime: string;
  confidence: number;
  reasons: string[];
  timestamp: number;
  algorithmVotes?: Array<{
    name: string;
    vote: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reason: string;
  }>;
  intensity?: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
}

interface FeedState {
  signals: Signal[];
  isConnected: boolean;
  connect: (symbols: string[], modes: ('scalp' | 'intraday' | 'swing')[]) => void;
  disconnect: () => void;
  addSignal: (signal: Signal) => void;
}

export const useFeedStore = create<FeedState>((set, get) => {
  let eventSource: EventSource | null = null;

  return {
    signals: [],
    isConnected: false,
    
    connect: (symbols: string[], modes: ('scalp' | 'intraday' | 'swing')[]) => {
      const { disconnect } = get();
      disconnect();
      
      const params = new URLSearchParams({
        symbols: symbols.join(','),
        modes: modes.join(','),
      });
      
      const url = `${API_BASE_URL}/sse?${params.toString()}`;
      eventSource = new EventSource(url);
      
      eventSource.onopen = () => {
        set({ isConnected: true });
      };
      
      eventSource.onmessage = (event) => {
        try {
          const signal: Signal = JSON.parse(event.data);
          get().addSignal(signal);
        } catch (err) {
          console.error('Error parsing signal:', err);
        }
      };
      
      eventSource.onerror = () => {
        set({ isConnected: false });
      };
    },
    
    disconnect: () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      set({ isConnected: false });
    },
    
    addSignal: (signal: Signal) => {
      set((state) => ({
        signals: [signal, ...state.signals.slice(0, 99)], // Son 100 sinyal
      }));
    },
  };
});

