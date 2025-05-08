import { useState } from 'react';
import Layout from './components/layout/Layout';
import TelegramPage from './pages/TelegramPage';

function App() {
  const [unreadStats, setUnreadStats] = useState<{
    personal_unread?: number;
    group_unread?: number;
    channel_unread?: number;
    total?: number;
  } | null>(null);
  
  // Handler to receive stats from TelegramPage
  const handleStatsUpdate = (stats: any) => {
    setUnreadStats(stats);
  };

  return (
    <Layout stats={unreadStats || undefined}>
      <TelegramPage onStatsUpdate={handleStatsUpdate} />
    </Layout>
  );
}

export default App;
