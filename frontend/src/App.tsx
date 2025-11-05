import { useEffect } from 'react';
import Home from './pages/Home';
import { useFeedStore } from './store/useFeed';

function App() {
  const { connect } = useFeedStore();

  useEffect(() => {
    // Varsayılan bağlantı
    connect(['BTCUSDT', 'ETHUSDT'], ['intraday']);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      <Home />
    </div>
  );
}

export default App;

