import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { HistoryPage } from './pages/HistoryPage';
import { LinkDetailPage } from './pages/LinkDetailPage';
import { NetworkPage } from './pages/NetworkPage';
import { AdminPage } from './pages/AdminPage';
import { TransparencyPage } from './pages/TransparencyPage';
import { useTheme } from './hooks/useTheme';
import { Navigate } from 'react-router-dom';

function AppInner() {
  // Initialize theme on app start
  useTheme();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/network" element={<NetworkPage />} />
      <Route path="/link/:id" element={<LinkDetailPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/transparency" element={<TransparencyPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
