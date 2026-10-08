import { useThemeStore } from '../store/themeStore';

export function StatCard({ label, value, unit, icon, color = '#39FF14', className = '' }) {
  const { theme } = useThemeStore();

  return (
    <div
      className={`rounded-2xl p-4 flex flex-col gap-2 transition-all duration-500 border ${
        theme === 'dark' 
          ? 'bg-white/5 border-white/10' 
          : 'bg-white border-slate-200 shadow-sm'
      } ${className}`}
      style={{
        boxShadow: theme === 'dark' ? `0 0 12px ${color}11` : 'none',
      }}
    >
      <div className={`flex items-center gap-2 transition-colors duration-500 ${
        theme === 'dark' ? 'text-gray-500' : 'text-slate-500'
      }`}>
        {icon && <span style={{ color }}>{icon}</span>}
        <span className="text-xs tracking-widest uppercase font-bold">{label}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className={`text-2xl font-heading font-black transition-colors duration-500 ${
          theme === 'dark' ? 'text-white' : 'text-slate-900'
        }`}>
          {value}
        </span>
        {unit && (
          <span className={`text-sm font-bold pb-0.5 transition-colors duration-500 ${
            theme === 'dark' ? 'text-gray-500' : 'text-slate-400'
          }`}>
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
