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
import { useAuth } from './context/AuthContext';
import { useAppContext } from './context/AppContext';
import './App.css';

import MetricCards from './components/MetricCards';
import PermitDataView from './components/PermitDataView';

function Dashboard() {
  const { activeView } = useAppContext();

  return (
    <div className="flex h-[calc(100vh-64px)] pt-16">
      <Sidebar />
      <main className="ml-64 w-full relative h-[calc(100vh-64px)] overflow-y-auto">
        {activeView === 'map' && (
          <>
            <MapContainer />
            <MetricCards />
          </>
        )}
        {activeView === 'permits' && <PermitDataView />}
      </main>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header />
      <div className="pt-16">
        <Routes>
          {/* Default Route handles Landing or redirects to Dashboard */}
          <Route 
            path="/" 
            element={
              loading ? null : (isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />)
            } 
          />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/compare" element={<ComparisonView />} />
          </Route>
        </Routes>
      </div>
    </div>
  );
}
