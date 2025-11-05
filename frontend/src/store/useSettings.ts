import { create } from 'zustand';

interface SettingsState {
  selectedSymbols: string[];
  selectedModes: ('scalp' | 'intraday' | 'swing')[];
  riskPercent: number;
  setSymbols: (symbols: string[]) => void;
  setModes: (modes: ('scalp' | 'intraday' | 'swing')[]) => void;
  setRiskPercent: (percent: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  selectedSymbols: ['BTCUSDT', 'ETHUSDT'],
  selectedModes: ['intraday'],
  riskPercent: 1.0,
  
  setSymbols: (symbols) => set({ selectedSymbols: symbols }),
  setModes: (modes) => set({ selectedModes: modes }),
  setRiskPercent: (percent) => set({ riskPercent: percent }),
}));

