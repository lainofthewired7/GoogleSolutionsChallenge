import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/auth';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const { user, updateUserState } = useAuth();
  const { selectedMarket, setMarket } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setIsUpdating(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const updatedUser = await updateProfile(displayName);
      updateUserState(updatedUser);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) return null; // Should be caught by ProtectedRoute anyway

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 h-[calc(100vh-64px)] overflow-y-auto">
      <div className="mb-10 fade-in-up">
        <h1 className="text-3xl font-headline font-black tracking-tight mb-2">Settings</h1>
        <p className="text-on-surface/60">Manage your profile and dashboard preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Sidebar Nav */}
        <div className="col-span-1 space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold transition-colors">
            Profile Details
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl text-on-surface/60 hover:bg-surface-variant/50 hover:text-on-surface transition-colors font-medium">
            Preferences
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl text-on-surface/60 hover:bg-surface-variant/50 hover:text-on-surface transition-colors font-medium">
            Security
          </button>
        </div>

        {/* Settings Content */}
        <div className="col-span-2 space-y-8">
          
          {/* Profile Section */}
          <div className="glass-panel p-8 rounded-2xl border border-outline-variant/10 shadow-lg relative overflow-hidden">
            <h2 className="text-xl font-headline font-bold mb-6">Profile Details</h2>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-on-surface/70 mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={user.email} 
                  disabled 
                  className="w-full bg-surface-container-highest border border-outline-variant/20 rounded-xl py-3 px-4 text-sm text-on-surface/50 cursor-not-allowed"
                />
                <p className="text-xs text-on-surface/40 mt-1.5 ml-1">Email cannot be changed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface/70 mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button 
                  type="submit" 
                  disabled={isUpdating || displayName === user.display_name}
                  className="bg-primary hover:bg-primary-dim text-on-primary py-2.5 px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(129,236,255,0.2)] active:scale-95"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
                
                {successMsg && <span className="text-primary text-sm font-bold bg-primary/10 px-3 py-1.5 rounded-lg">{successMsg}</span>}
                {errorMsg && <span className="text-error text-sm font-bold bg-error/10 px-3 py-1.5 rounded-lg">{errorMsg}</span>}
              </div>
            </form>
          </div>

          {/* Preferences Section */}
          <div className="glass-panel p-8 rounded-2xl border border-outline-variant/10 shadow-lg relative overflow-hidden mt-8">
            <h2 className="text-xl font-headline font-bold mb-6">Dashboard Preferences</h2>
            
            <div className="space-y-6">
              {/* Theme Toggle */}
              <div>
                <label className="block text-sm font-medium text-on-surface/70 mb-2">Appearance</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-primary/10 border-primary text-primary font-bold'
                        : 'border-outline-variant/30 text-on-surface/60 hover:border-outline-variant/60'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">light_mode</span>
                    <span className="text-sm">Light</span>
                  </button>
                  <button
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-primary/10 border-primary text-primary font-bold'
                        : 'border-outline-variant/30 text-on-surface/60 hover:border-outline-variant/60'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">dark_mode</span>
                    <span className="text-sm">Dark</span>
                  </button>
                </div>
              </div>

              {/* Default Market */}
              <div>
                <label className="block text-sm font-medium text-on-surface/70 mb-2">Default Target Market</label>
                <select 
                  value={selectedMarket}
                  onChange={(e) => setMarket(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                >
                  <option value="austin-round-rock-tx">Austin-Round Rock, TX (MSA)</option>
                  <option value="dallas-ft-worth-tx">Dallas-Fort Worth, TX (MSA)</option>
                  <option value="san-antonio-tx">San Antonio, TX (MSA)</option>
                  <option value="houston-tx">Houston, TX (MSA)</option>
                </select>
                <p className="text-xs text-on-surface/40 mt-1.5 ml-1">This market will heavily focus your default dashboard view.</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
