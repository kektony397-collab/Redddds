
import React, { useState, useEffect } from 'react';
import { db } from './lib/db';
import { useAppStore } from './store/useAppStore';
import useGeolocation from './hooks/useGeolocation';

import SpeedometerView from './components/views/SpeedometerView';
import HistoryView from './components/views/HistoryView';
import SettingsView from './components/views/SettingsView';

import { Gauge, BookOpen, Settings, Fuel } from './components/Icons';

type View = 'speedometer' | 'history' | 'settings';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('speedometer');
  const { setVehicleAverage, setTankSize, setRemainingFuel } = useAppStore();

  useGeolocation();

  useEffect(() => {
    const loadSettings = async () => {
      const avg = await db.settings.get('vehicleAverageKmL');
      const tank = await db.settings.get('tankSize');
      const fuel = await db.settings.get('remainingFuel');
      if (avg) setVehicleAverage(avg.value as number);
      if (tank) setTankSize(tank.value as number);
      if (fuel) setRemainingFuel(fuel.value as number);
    };
    loadSettings();
  }, [setVehicleAverage, setTankSize, setRemainingFuel]);

  const renderView = () => {
    switch (activeView) {
      case 'speedometer':
        return <SpeedometerView />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <SpeedometerView />;
    }
  };

  const NavItem = ({ view, label, icon }: { view: View, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
        activeView === view ? 'text-brand-primary' : 'text-brand-text-muted hover:text-brand-text'
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      <main className="flex-grow flex flex-col p-4 overflow-y-auto">
        {renderView()}
      </main>
      <footer className="w-full text-center text-xs text-brand-text-muted py-2">
        created by Yash K Pathak
      </footer>
      <nav className="w-full bg-brand-surface shadow-lg border-t border-gray-700 flex">
        <NavItem view="speedometer" label="Speed" icon={<Gauge className="w-6 h-6" />} />
        <NavItem view="history" label="History" icon={<BookOpen className="w-6 h-6" />} />
        <NavItem view="settings" label="Settings" icon={<Settings className="w-6 h-6" />} />
      </nav>
    </div>
  );
};

export default App;
