export default function PermitDataView() {
  return (
    <div className="p-8 min-h-screen">
      {/* Header */}
      <header className="mb-10 flex justify-between items-end">
        <div>
          <nav className="flex gap-2 text-xs text-on-surface-variant mb-2 font-label">
            <span>Texas</span>
            <span>/</span>
            <span className="text-primary">Austin MSA</span>
          </nav>
          <h1 className="text-4xl font-headline font-extrabold tracking-tighter text-on-surface">
            Austin–Round Rock Development Pipeline
          </h1>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-surface-container-high text-on-surface text-sm font-semibold rounded-md border border-outline-variant/10 hover:bg-surface-container-highest transition-colors">
            Export PDF
          </button>
          <button className="px-4 py-2 bg-primary text-on-primary text-sm font-bold rounded-md hover:brightness-105 transition-all">
            Generate Insights
          </button>
        </div>
      </header>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-gradient-to-br from-surface-container-high to-surface-container-low rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <p className="text-on-surface-variant text-sm font-medium mb-1">Total Permitted Value</p>
          <h2 className="text-4xl font-headline font-extrabold text-on-surface">$3.82B</h2>
          <div className="mt-4 flex items-center gap-2 text-xs text-primary font-bold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+12.4% YoY</span>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-surface-container-high to-surface-container-low rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-tertiary/5 rounded-full blur-2xl group-hover:bg-tertiary/10 transition-colors"></div>
          <p className="text-on-surface-variant text-sm font-medium mb-1">Avg. Approval Time</p>
          <h2 className="text-4xl font-headline font-extrabold text-on-surface">142 Days</h2>
          <div className="mt-4 flex items-center gap-2 text-xs text-error font-bold">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>-8% efficiency vs 2023</span>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-surface-container-high to-surface-container-low rounded-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          <p className="text-on-surface-variant text-sm font-medium mb-1">New Residential Units</p>
          <h2 className="text-4xl font-headline font-extrabold text-on-surface">14,204</h2>
          <div className="mt-4 flex items-center gap-2 text-xs text-primary font-bold">
            <span className="material-symbols-outlined text-sm">add_home</span>
            <span>2,105 pending review</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Block */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        {/* Development Heatmap (Seaborn) */}
        <div className="lg:col-span-3 bg-surface-container-low rounded-xl overflow-hidden relative min-h-[400px]">
          <div className="absolute top-4 left-4 z-10 p-3 rounded-lg border border-outline-variant/20" style={{ background: 'rgba(60, 71, 90, 0.4)', backdropFilter: 'blur(16px)' }}>
            <h3 className="text-on-surface font-headline font-bold text-sm">Permit Activity Heatmap</h3>
            <p className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mt-1">Type × Month Breakdown</p>
          </div>
          <img
            alt="Seaborn heatmap of permit activity by type and month"
            className="w-full h-full object-contain"
            src="/api/charts/permits-heatmap?market=austin"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
            <div className="p-2 rounded-md border border-outline-variant/10 text-[10px] text-on-surface font-bold" style={{ background: 'rgba(60, 71, 90, 0.4)', backdropFilter: 'blur(16px)' }}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#00E5FF]"></span>
                Live from Socrata API
              </div>
            </div>
          </div>
        </div>

        {/* New Permits Issued Chart */}
        <div className="lg:col-span-2 bg-surface-container-low rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-on-surface font-headline font-bold text-lg">New Permits Issued</h3>
            <p className="text-on-surface-variant text-xs mb-6">Residential vs. Commercial (L12M)</p>
          </div>
          
          <div className="flex-1 flex items-end gap-2 mb-4 h-48">
            {/* Faux Bar Chart */}
            <div className="flex-1 flex flex-col justify-end gap-1 group">
              <div className="w-full bg-primary/20 rounded-t h-[60%] relative overflow-hidden"><div className="absolute inset-x-0 bottom-0 bg-primary/40 h-1/2"></div></div>
              <div className="w-full bg-on-surface-variant/10 rounded-t h-[40%]"></div>
              <span className="text-[8px] text-center mt-2 opacity-50">OCT</span>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-1">
              <div className="w-full bg-primary/20 rounded-t h-[85%] relative overflow-hidden"><div className="absolute inset-x-0 bottom-0 bg-primary/40 h-1/2"></div></div>
              <div className="w-full bg-on-surface-variant/10 rounded-t h-[55%]"></div>
              <span className="text-[8px] text-center mt-2 opacity-50">NOV</span>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-1">
              <div className="w-full bg-primary/20 rounded-t h-[70%] relative overflow-hidden"><div className="absolute inset-x-0 bottom-0 bg-primary/40 h-1/2"></div></div>
              <div className="w-full bg-on-surface-variant/10 rounded-t h-[30%]"></div>
              <span className="text-[8px] text-center mt-2 opacity-50">DEC</span>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-1">
              <div className="w-full bg-primary/20 rounded-t h-[95%] relative overflow-hidden shadow-[0_0_15px_rgba(129,236,255,0.2)]"><div className="absolute inset-x-0 bottom-0 bg-primary/40 h-1/2"></div></div>
              <div className="w-full bg-on-surface-variant/10 rounded-t h-[45%]"></div>
              <span className="text-[8px] text-center mt-2 opacity-50">JAN</span>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-1">
              <div className="w-full bg-primary/20 rounded-t h-[40%] relative overflow-hidden"><div className="absolute inset-x-0 bottom-0 bg-primary/40 h-1/2"></div></div>
              <div className="w-full bg-on-surface-variant/10 rounded-t h-[20%]"></div>
              <span className="text-[8px] text-center mt-2 opacity-50">FEB</span>
            </div>
            <div className="flex-1 flex flex-col justify-end gap-1">
              <div className="w-full bg-primary/20 rounded-t h-[80%] relative overflow-hidden"><div className="absolute inset-x-0 bottom-0 bg-primary/40 h-1/2"></div></div>
              <div className="w-full bg-on-surface-variant/10 rounded-t h-[60%]"></div>
              <span className="text-[8px] text-center mt-2 opacity-50">MAR</span>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-outline-variant/10">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-primary/60"></span>
              <span className="text-[10px] text-on-surface font-bold">Residential</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-on-surface-variant/20"></span>
              <span className="text-[10px] text-on-surface font-bold">Commercial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Major Active Projects Table */}
      <section className="bg-surface-container-low rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 flex justify-between items-center">
          <h3 className="text-on-surface font-headline font-bold text-lg">Major Active Projects</h3>
          <button className="text-primary text-xs font-bold hover:underline">View All Projects</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-variant/30 text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
                <th className="px-6 py-3">Project Name</th>
                <th className="px-6 py-3">Permit Type</th>
                <th className="px-6 py-3 text-right">Valuation</th>
                <th className="px-6 py-3">Current Status</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              <tr className="hover:bg-surface-variant/10 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-surface-container-high overflow-hidden border border-outline-variant/20">
                      <img alt="Tower project thumbnail" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAFQCe_y_ZrLpwZqMUOSppJoMACa-ywyOLn-R-BM1QU3XGv6V5bQMx86TQbJsamjHi7UmUf-OiqwOWqTax4goqGZMCwFBTWrJcWSjSTtL0mHc-9zWstz4kG7jfO9eYiz5ninkF77tQAo4M7XQsKdk7QYX5L3aOfxfCtSsrtZgBLP9mahQbp5LKuFkYzFbQDg6AI1zkHKbDLrD1mopFZLy_U4kTNSW511hT2Akut5wPIikZ_tstu6HBkdIvUB5rg0_btgrOvwac3jaE"/>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-on-surface">The Republic Tower</div>
                      <div className="text-[10px] text-on-surface-variant font-label">4th &amp; Guadalupe, ATX</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-tighter">Mixed-Use</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-headline font-bold text-on-surface">$580,000,000</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-xs text-on-surface">Groundbreaking</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-surface-variant/10 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-surface-container-high overflow-hidden border border-outline-variant/20">
                      <img alt="Luxury apartment project" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuByjMLMSgO1-jGPIHBJKAfO_a20YeG2moWsUPL0hHwDOlniMWTNuro0h4OnO8ylhjT2d3pumzq2l1HZpucN66RfZRbtgig5qNYaBaJOIi5oGLr0NMgKQ0YhZCGueiEPaPZp74KY4jE7t62wgQCz17N-u3c8sZRUsBcafkZomjRjho7g2FjZZop0eLxzOjvuVgVqNn6eA7T7xekQxwFnI4ZpDx-YVvTiwOr8hcvEJ83EmceHC8WjbuIgD76y7GkvToyqYtk6koAYxzg"/>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-on-surface">E. Riverside Lofts</div>
                      <div className="text-[10px] text-on-surface-variant font-label">Riverside Corridor</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-tighter">Multi-Family</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-headline font-bold text-on-surface">$145,200,000</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-tertiary-dim"></span>
                    <span className="text-xs text-on-surface">In Review</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </td>
              </tr>
              <tr className="hover:bg-surface-variant/10 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-surface-container-high overflow-hidden border border-outline-variant/20">
                      <img alt="Corporate campus" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDW-TNUy7qJ3TE4GIhi-K8s1_yK8UGrF6khuMtiHKrBaX5xRKhbkjAyk4qKCYwtCrpC5CvLEH-tOZS4zjMcOgdX23HsLCzHwp8ZGIRr0a6nJMH5HJ9z5MFdnLQVJNaOuwwAc_Nl5MC_49qmiazHAG5Oq9nEKYqmBfhdXPIkRGPkxgzpqjNVFWv3pAHNr9u5ZMfZkuj2rm18ohNyUE0AAlgFIPezdsEIvkdzgtE1Wo7peBk21ERn3KRmfL9U5AGpcWZk3xEqzdZXy4"/>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-on-surface">North Austin Tech Hub</div>
                      <div className="text-[10px] text-on-surface-variant font-label">Domain Northside</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-tighter">Commercial</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="text-sm font-headline font-bold text-on-surface">$225,800,000</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary/60"></span>
                    <span className="text-xs text-on-surface">Final Inspection</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">arrow_forward</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Floating Filter Trigger (Mobile Only) */}
      <button className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center z-50">
        <span className="material-symbols-outlined">filter_list</span>
      </button>

    </div>
  );
}
