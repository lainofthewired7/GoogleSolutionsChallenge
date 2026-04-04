/**
 * App — root component with client-side routing.
 */

import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapContainer from './components/MapContainer';
import ComparisonView from './components/ComparisonView';
import './App.css';

import MetricCards from './components/MetricCards';

function Dashboard() {
  return (
    <div className="flex h-screen pt-16">
      <Sidebar />
      <main className="ml-64 w-full relative">
        <MapContainer />
        <MetricCards />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/compare" element={<ComparisonView />} />
      </Routes>
    </>
  );
}
