import React, { useState, useEffect } from 'react';
import { DatasetProvider } from './context/DatasetContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import LoginPage from './pages/LoginPage';

// Pages
import Overview from './pages/Overview';
import DatasetExplorer from './pages/DatasetExplorer';
import DataPreparation from './pages/DataPreparation';
import PCAAnalysis from './pages/PCAAnalysis';
import TSNEAnalysis from './pages/TSNEAnalysis';
import Comparison from './pages/Comparison';
import Methodology from './pages/Methodology';
import About from './pages/About';
import ExportData from './pages/ExportData';
import MinimalView from './pages/MinimalView';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('traffic_viz_authenticated') === 'true';
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('traffic_viz_authenticated');
    sessionStorage.removeItem('traffic_viz_user');
    setIsAuthenticated(false);
  };

  // If not logged in, show the clean LoginPage
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview setActiveTab={setActiveTab} />;
      case 'explorer':
        return <DatasetExplorer />;
      case 'preparation':
        return <DataPreparation />;
      case 'pca':
        return <PCAAnalysis />;
      case 'tsne':
        return <TSNEAnalysis />;
      case 'comparison':
        return <Comparison />;
      case 'methodology':
        return <Methodology />;
      case 'about':
        return <About />;
      case 'export':
        return <ExportData />;
      case 'minimal':
        return <MinimalView />;
      default:
        return <Overview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <DatasetProvider>
      <div className="min-h-screen bg-canvas text-[#172033] flex flex-col antialiased">
        {/* Responsive Desktop Sidebar & Mobile Drawer */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <div className="lg:pl-72 flex-1 flex flex-col min-w-0 transition-all duration-300">
          <Header
            activeTab={activeTab}
            setIsSidebarOpen={setIsSidebarOpen}
            onLogout={handleLogout}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderActivePage()}
          </main>

          <footer className="border-t border-borderSubtle bg-white/60 py-4 px-6 text-center text-xs text-slate-400">
            Traffic Flow Data Visualization Using PCA and t-SNE • BTech Machine Learning Project Demonstration • StudyForge Analytics
          </footer>
        </div>
      </div>
    </DatasetProvider>
  );
}
