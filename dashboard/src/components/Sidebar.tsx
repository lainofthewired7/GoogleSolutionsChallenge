import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';

export default function Sidebar() {
  const { logout } = useAuth();
  const { layers, toggleLayer, activeView, setActiveView } = useAppContext();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-surface-container-low flex flex-col py-6 shadow-[4px_0_24px_rgba(129,236,255,0.06)] font-body text-sm font-medium z-40">
      <div className="px-6 mb-8">
        <h3 className="text-on-surface font-bold text-xs uppercase tracking-widest opacity-60">Map Controls</h3>
        <p className="text-primary text-[10px] font-bold tracking-tighter">Obsidian Lens Engine</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        <button 
          onClick={() => {
            setActiveView('map');
            if (!layers.heatmap) toggleLayer('heatmap');
          }}
          className={`w-full flex items-center justify-start gap-3 py-3 px-4 ${activeView === 'map' && layers.heatmap ? 'border-l-2 border-primary bg-surface-container-high text-primary' : 'text-on-surface/60 hover:bg-surface-variant hover:text-on-surface'} transition-all duration-200 ease-in-out cursor-pointer`}
        >
          <span className="material-symbols-outlined">payments</span>
          <span>Rent Heatmap</span>
        </button>

        <button 
          onClick={() => setActiveView('permits')}
          className={`w-full flex items-center justify-start gap-3 py-3 px-4 ${activeView === 'permits' ? 'border-l-2 border-primary bg-surface-container-high text-primary' : 'text-on-surface/60 hover:bg-surface-variant hover:text-on-surface'} transition-all duration-200 ease-in-out cursor-pointer`}
        >
          <span className="material-symbols-outlined">architecture</span>
          <span>Permit Data</span>
        </button>

        <button 
          onClick={() => setActiveView('jobs')}
          className={`w-full flex items-center justify-start gap-3 py-3 px-4 ${activeView === 'jobs' ? 'border-l-2 border-primary bg-surface-container-high text-primary' : 'text-on-surface/60 hover:bg-surface-variant hover:text-on-surface'} transition-all duration-200 ease-in-out cursor-pointer`}
        >
          <span className="material-symbols-outlined">trending_up</span>
          <span>Job Growth</span>
        </button>

        <button 
          onClick={() => setActiveView('rents')}
          className={`w-full flex items-center justify-start gap-3 py-3 px-4 ${activeView === 'rents' ? 'border-l-2 border-primary bg-surface-container-high text-primary' : 'text-on-surface/60 hover:bg-surface-variant hover:text-on-surface'} transition-all duration-200 ease-in-out cursor-pointer`}
        >
          <span className="material-symbols-outlined">analytics</span>
          <span>Rent Performance</span>
        </button>
        
        <button 
          onClick={() => setActiveView('comparison')}
          className={`w-full flex items-center justify-start gap-3 py-3 px-4 ${activeView === 'comparison' ? 'border-l-2 border-primary bg-surface-container-high text-primary' : 'text-on-surface/60 hover:bg-surface-variant hover:text-on-surface'} transition-all duration-200 ease-in-out cursor-pointer`}
        >
          <span className="material-symbols-outlined">compare_arrows</span>
          <span>Market Comparison</span>
        </button>
      </nav>

      <div className="mt-auto border-t border-outline-variant/10 pt-4">
        <a className="flex items-center gap-3 py-2 px-6 text-on-surface/60 hover:text-on-surface cursor-pointer">
          <span className="material-symbols-outlined">help</span>
          <span>Help</span>
        </a>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 py-2 px-6 text-on-surface/60 hover:text-error cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
