import { motion } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';

export function NeonButton({ children, onClick, variant = 'green', size = 'md', disabled = false, className = '', type = 'button' }) {
  const { theme } = useThemeStore();

  const isDark = theme === 'dark';

  const variants = {
    green: {
      bg: isDark ? 'from-[#39FF14]/20 to-[#39FF14]/5' : 'from-emerald-100 to-emerald-50',
      border: isDark ? 'border-[#39FF14]/40' : 'border-emerald-200',
      text: isDark ? 'text-[#39FF14]' : 'text-emerald-800',
      glow: isDark ? '0 0 20px #39FF1444, 0 0 40px #39FF1422' : 'none',
      hoverGlow: isDark ? '0 0 30px #39FF1466, 0 0 60px #39FF1433' : 'none',
    },
    blue: {
      bg: isDark ? 'from-[#00D4FF]/20 to-[#00D4FF]/5' : 'from-sky-100 to-sky-50',
      border: isDark ? 'border-[#00D4FF]/40' : 'border-sky-200',
      text: isDark ? 'text-[#00D4FF]' : 'text-sky-800',
      glow: isDark ? '0 0 20px #00D4FF44, 0 0 40px #00D4FF22' : 'none',
      hoverGlow: isDark ? '0 0 30px #00D4FF66, 0 0 60px #00D4FF33' : 'none',
    },
    purple: {
      bg: isDark ? 'from-[#BF5AF2]/20 to-[#BF5AF2]/5' : 'from-purple-100 to-purple-50',
      border: isDark ? 'border-[#BF5AF2]/40' : 'border-purple-200',
      text: isDark ? 'text-[#BF5AF2]' : 'text-purple-800',
      glow: isDark ? '0 0 20px #BF5AF244, 0 0 40px #BF5AF222' : 'none',
      hoverGlow: isDark ? '0 0 30px #BF5AF266, 0 0 60px #BF5AF233' : 'none',
    },
    solid: {
      bg: 'from-[#39FF14] to-[#22c55e]',
      border: 'border-transparent',
      text: 'text-black',
      glow: isDark ? '0 0 24px #39FF1466' : '0 4px 20px rgba(57,255,20,0.4)',
      hoverGlow: isDark ? '0 0 40px #39FF1488' : '0 8px 30px rgba(57,255,20,0.6)',
    },
    danger: {
      bg: isDark ? 'from-[#FF3B30]/20 to-[#FF3B30]/5' : 'from-rose-100 to-rose-50',
      border: isDark ? 'border-[#FF3B30]/40' : 'border-rose-200',
      text: isDark ? 'text-[#FF3B30]' : 'text-rose-800',
      glow: isDark ? '0 0 20px #FF3B3044' : 'none',
      hoverGlow: isDark ? '0 0 30px #FF3B3066' : 'none',
    },
    outline: {
      bg: isDark ? 'from-transparent to-transparent' : 'from-transparent to-transparent',
      border: isDark ? 'border-[#39FF14]/40 hover:border-[#39FF14]/80' : 'border-slate-300 hover:border-flexigo-teal',
      text: isDark ? 'text-[#39FF14]' : 'text-slate-800',
      glow: 'none',
      hoverGlow: isDark ? '0 0 20px #39FF1422' : 'none',
    },
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
    full: 'w-full py-4 text-base',
  };

  const v = variants[variant] || variants.green;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      className={`relative font-heading font-black rounded-xl bg-gradient-to-br transition-all duration-500 tracking-wide overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed ${v.bg} border ${v.border} ${v.text} ${sizes[size]} ${className}`}
      style={{ boxShadow: v.glow }}
    >
      <span className="relative z-10 flex items-center justify-center gap-2 uppercase tracking-[0.2em]">{children}</span>
    </motion.button>
  );
}
