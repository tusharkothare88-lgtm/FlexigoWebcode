import { motion } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';

export const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const pageTransition = {
  type: 'spring',
  damping: 32,
  stiffness: 300,
};

export function PageWrapper({ children, className = '' }) {
  const { theme } = useThemeStore();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className={`min-h-full w-full flex flex-col transition-colors duration-500 ${
        theme === 'dark' ? 'bg-[#0A0A0F]' : 'bg-white'
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
