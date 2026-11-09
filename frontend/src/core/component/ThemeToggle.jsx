import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useGlobalTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '', showLabel = false }) {
  const { isDark, toggleTheme } = useGlobalTheme();

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`group relative flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-slate-700 shadow-sm backdrop-blur-md transition-colors duration-300 hover:border-indigo-400/50 hover:bg-white/90 hover:text-indigo-600 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-200 dark:shadow-indigo-500/10 dark:hover:border-indigo-400/30 dark:hover:bg-slate-800/80 dark:hover:text-amber-300 ${className}`}
    >
      <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="sun-icon"
              initial={{ rotate: -90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <Sun className="h-4 w-4 text-amber-400" />
            </motion.div>
          ) : (
            <motion.div
              key="moon-icon"
              initial={{ rotate: 90, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <Moon className="h-4 w-4 text-indigo-600" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showLabel && (
        <span className="text-xs font-semibold tracking-wide">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </motion.button>
  );
}