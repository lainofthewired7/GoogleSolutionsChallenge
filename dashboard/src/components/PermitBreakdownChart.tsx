import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { getPermitsBreakdown } from '../services/api';

export default function PermitBreakdownChart() {
  const { selectedMarket } = useAppContext();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    getPermitsBreakdown(selectedMarket)
      .then(res => {
        if (mounted && res.data) {
          setData(res.data);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });
      
    return () => { mounted = false; };
  }, [selectedMarket]);

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-48 flex items-center justify-center text-on-surface-variant text-xs">
        No breakdown data available
      </div>
    );
  }

  return (
    <div className="w-full h-48 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 
          />
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: isDark ? '#94a3b8' : '#64748b' }}
            tickFormatter={(val) => val.split('-')[1] + '/' + val.split('-')[0].slice(2)}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: isDark ? '#94a3b8' : '#64748b' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? '#1e293b' : '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '10px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}
            itemStyle={{ padding: '0 2px' }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} 
            iconType="rect"
            iconSize={10}
          />
          <Bar 
            dataKey="residential" 
            name="Residential" 
            fill={isDark ? '#00E5FF' : '#0097A7'} 
            radius={[2, 2, 0, 0]} 
            barSize={12}
          />
          <Bar 
            dataKey="commercial" 
            name="Commercial" 
            fill={isDark ? '#cbd5e1' : '#94a3b8'} 
            radius={[2, 2, 0, 0]} 
            barSize={12}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
