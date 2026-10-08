import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Reset window scroll position
    window.scrollTo(0, 0);

    // Clean up any lingering Lenis classes or styles on route change
    document.documentElement.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
    document.body.classList.remove('lenis', 'lenis-smooth', 'lenis-stopped', 'lenis-scrolling');
    
    // Ensure body scroll is unlocked in case any component locked it
    document.body.style.overflow = '';
  }, [pathname]);

  return null;
};

export default ScrollToTop;
