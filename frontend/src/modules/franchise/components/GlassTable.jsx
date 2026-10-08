import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlassTable({ columns, data, onRowClick, selectedId, emptyMessage = "No records found" }) {
  const rowsRef = useRef([]);

  return (
    <div className="w-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm backdrop-blur-3xl relative z-10">
      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-[var(--bg-tertiary)]/40 border-b border-[var(--border-subtle)]">
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-4 text-[7px] font-black uppercase tracking-[0.3em] text-[var(--text-tertiary)] italic opacity-40">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]/30">
            <AnimatePresence mode="popLayout">
              {data.length > 0 ? (
                data.map((row, rowIndex) => {
                  const isSelected = selectedId && (row._id === selectedId || row.id === selectedId);
                  return (
                    <motion.tr
                      key={row._id || row.id || rowIndex}
                      ref={el => rowsRef.current[rowIndex] = el}
                      initial={{ opacity: 0, scale: 0.995, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, x: -10 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: Math.min(rowIndex * 0.04, 0.4), 
                        ease: [0.16, 1, 0.3, 1] 
                      }}
                      onClick={() => onRowClick && onRowClick(row)}
                      className={`group transition-all duration-300 relative ${onRowClick ? 'cursor-pointer' : ''} ${isSelected ? 'bg-emerald-500/[0.08] shadow-[inset_4px_0_0_0_#10b981]' : 'hover:bg-emerald-500/[0.04]'}`}
                    >
                      {columns.map((col, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap transition-transform duration-500 group-hover:translate-x-1 relative z-10">
                          {col.render ? col.render(row) : (
                            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-tight">
                              {row[col.accessor]}
                            </span>
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })
              ) : (
                <motion.tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                       <span className="text-sm font-bold uppercase tracking-widest">{emptyMessage}</span>
                       <div className="w-8 h-px bg-emerald-500" />
                    </div>
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
