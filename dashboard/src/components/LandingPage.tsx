import { useState } from 'react';
import LoginModal from './LoginModal';

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background flex flex-col items-center justify-center pt-24 pb-16 font-body text-on-surface w-full overflow-x-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none -z-10"></div>
      
      <div className="max-w-4xl text-center px-6 relative z-10 fade-in-up">
        <h1 className="text-5xl md:text-7xl font-headline font-black tracking-tighter mb-6 bg-gradient-to-r from-primary via-tertiary to-primary bg-clip-text text-transparent" style={{ animation: "gradient-shift 8s ease infinite", backgroundSize: "200% 200%" }}>
          Real Estate Intelligence
          <br />for the Future
        </h1>
        <p className="text-lg md:text-xl text-on-surface/70 mb-12 max-w-2xl mx-auto tracking-tight font-medium">
          Projectr Analytics delivers real-time geospatial intelligence, rent forecasts, and permit data for the Austin–Round Rock MSA.
        </p>
        <button
          onClick={() => setShowLogin(true)}
          className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(129,236,255,0.4)] hover:shadow-[0_0_60px_rgba(129,236,255,0.6)]"
        >
          Sign In to Access Dashboard
        </button>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 px-6 w-full max-w-6xl relative z-10">
        <div className="glass-panel p-8 rounded-2xl border border-outline-variant/10 text-left hover:border-primary/40 transition-colors duration-300 group">
          <span className="material-symbols-outlined text-4xl text-primary mb-4 group-hover:scale-110 transition-transform">map</span>
          <h3 className="text-xl font-headline font-bold mb-2">Geospatial Data</h3>
          <p className="text-sm text-on-surface/60">Interactive heatmaps integrating census, HUD, and Zillow data for neighborhood insights.</p>
        </div>
        <div className="glass-panel p-8 rounded-2xl border border-outline-variant/10 text-left hover:border-tertiary/40 transition-colors duration-300 group">
          <span className="material-symbols-outlined text-4xl text-tertiary mb-4 group-hover:scale-110 transition-transform">business_center</span>
          <h3 className="text-xl font-headline font-bold mb-2">Market Fundamentals</h3>
          <p className="text-sm text-on-surface/60">Real-time tracking of vacancy rates, permit filings, and job migrations.</p>
        </div>
        <div className="glass-panel p-8 rounded-2xl border border-outline-variant/10 text-left hover:border-error/40 transition-colors duration-300 group">
          <span className="material-symbols-outlined text-4xl text-error mb-4 group-hover:scale-110 transition-transform">monitoring</span>
          <h3 className="text-xl font-headline font-bold mb-2">Dynamic Forecasts</h3>
          <p className="text-sm text-on-surface/60">Instantly compare submarkets, zip codes, and census tracts with predictive market forecasts.</p>
        </div>
      </div>
      
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
