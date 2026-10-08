import { useThemeStore } from '../store/themeStore';

export function GlassCard({ children, className = '', onClick, glow = false, glowColor = '#39FF14' }) {
  const { theme } = useThemeStore();

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border transition-all duration-500 ${
        theme === 'dark' 
          ? 'border-white/10 bg-black' 
          : 'border-slate-200 bg-white shadow-xl shadow-slate-200/40'
      } ${className}`}
      style={{
        boxShadow: (glow && theme === 'dark')
          ? `0 0 12px ${glowColor}33` 
          : 'none'
      }}
    >
      {children}
    </div>
  );
}
