import { useState } from 'react';
import { useSettingsStore } from '../store/useSettings';
import { useFeedStore } from '../store/useFeed';

const AVAILABLE_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT',
  'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'LINKUSDT',
  'MATICUSDT', 'UNIUSDT', 'LTCUSDT', 'ATOMUSDT', 'ETCUSDT',
  'XLMUSDT', 'ALGOUSDT', 'VETUSDT', 'FILUSDT', 'TRXUSDT',
  'EOSUSDT', 'AAVEUSDT', 'THETAUSDT', 'AXSUSDT', 'SANDUSDT',
  'MANAUSDT', 'NEARUSDT', 'APTUSDT', 'ARBUSDT', 'OPUSDT',
];
const AVAILABLE_MODES: ('scalp' | 'intraday' | 'swing')[] = ['scalp', 'intraday', 'swing'];

export default function SettingsPanel() {
  const { selectedSymbols, selectedModes, riskPercent, setSymbols, setModes, setRiskPercent } = useSettingsStore();
  const { connect, disconnect, isConnected } = useFeedStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    disconnect();
    setTimeout(() => {
      connect(selectedSymbols, selectedModes);
    }, 500);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-gray-700"
      >
        ⚙️ Ayarlar
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 bg-slate-800 border border-gray-700 rounded-lg p-4 w-80 shadow-xl">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Semboller</label>
            <div className="space-y-2">
              {AVAILABLE_SYMBOLS.map((symbol) => (
                <label key={symbol} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSymbols.includes(symbol)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSymbols([...selectedSymbols, symbol]);
                      } else {
                        setSymbols(selectedSymbols.filter((s) => s !== symbol));
                      }
                    }}
                    className="mr-2"
                  />
                  <span>{symbol}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Modlar</label>
            <div className="space-y-2">
              {AVAILABLE_MODES.map((mode) => (
                <label key={mode} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedModes.includes(mode)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setModes([...selectedModes, mode]);
                      } else {
                        setModes(selectedModes.filter((m) => m !== mode));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="capitalize">{mode}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Risk %: {riskPercent}%
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={riskPercent}
              onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="mb-4">
            <div className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              Durum: {isConnected ? 'Bağlı' : 'Bağlı değil'}
            </div>
          </div>

          <button
            onClick={handleApply}
            className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          >
            Uygula
          </button>
        </div>
      )}
    </div>
  );
}

