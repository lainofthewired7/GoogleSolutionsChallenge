/**
 * App — root component with client-side routing.
 */

import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapContainer from './components/MapContainer';
import ComparisonView from './components/ComparisonView';
import './App.css';

function Dashboard() {
  return (
    <main id="app-main">
      <Sidebar />
      <MapContainer />
    </main>
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
