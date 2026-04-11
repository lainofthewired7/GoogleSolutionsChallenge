/**
 * App — root component with client-side routing.
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapContainer from './components/MapContainer';
import ComparisonView from './components/ComparisonView';
import LandingPage from './components/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';
import SettingsPage from './components/SettingsPage';
import { useAuth } from './context/AuthContext';
import { useAppContext } from './context/AppContext';
import './App.css';

import MetricCards from './components/MetricCards';
import PermitDataView from './components/PermitDataView';
import JobGrowthView from './components/JobGrowthView';
import RentAnalyticsView from './components/RentAnalyticsView';

import DensityView from './components/DensityView';

function Dashboard() {
  const { activeView } = useAppContext();

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className={`ml-64 w-full relative h-full ${activeView === 'map' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {activeView === 'map' && (
          <>
            <MapContainer />
            <MetricCards />
          </>
        )}
        {activeView === 'permits' && <PermitDataView />}
        {activeView === 'jobs' && <JobGrowthView />}
        {activeView === 'rents' && <RentAnalyticsView />}
        {activeView === 'comparison' && <ComparisonView />}
        {activeView === 'density' && <DensityView />}
      </main>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header />
      <div className="pt-16 h-screen">
        <Routes>
          <Route 
            path="/" 
            element={
              loading ? null : (isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />)
            } 
          />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}
