import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { HistoryPage } from './pages/HistoryPage';
import { LinkDetailPage } from './pages/LinkDetailPage';
import { NetworkPage } from './pages/NetworkPage';
import { AdminPage } from './pages/AdminPage';
import { TransparencyPage } from './pages/TransparencyPage';
import { BlockedRegionPage } from './pages/BlockedRegionPage';
import { useTheme } from './hooks/useTheme';

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
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('https://get.geojs.io/v1/ip/country.json')
      .then(res => res.json())
      .then(data => {
        if (data && data.country === 'BR') {
          setIsAllowed(true);
        } else {
          setIsAllowed(false);
        }
      })
      .catch(() => {
        // Se a API falhar, não temos certeza, então barramos por segurança, 
        // ou permitimos caso queira evitar falsos positivos. Para cumprir estritamente a ordem: 
        setIsAllowed(false);
      });
  }, []);

  if (isAllowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-surface-950">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAllowed === false) {
    return <BlockedRegionPage />;
  }

  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
