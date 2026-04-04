/**
 * App — root component assembling Header, Sidebar, and MapContainer.
 */

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapContainer from './components/MapContainer';
import './App.css';

export default function App() {
  return (
    <>
      <Header />
      <main id="app-main">
        <Sidebar />
        <MapContainer />
      </main>
    </>
  );
}
