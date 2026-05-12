import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalShellProps {
  title: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  onClose: () => void;
  children: React.ReactNode;
}

const SIZE_CLASSES: Record<NonNullable<ModalShellProps['size']>, string> = {
  sm: 'max-w-[min(92vw,24rem)]',
  md: 'max-w-[min(94vw,34rem)]',
  lg: 'max-w-[min(96vw,58rem)]',
};

export const ModalShell: React.FC<ModalShellProps> = ({
  title,
  subtitle,
  size = 'md',
  onClose,
  children,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 px-2 py-2 landscape:py-1 md:px-4 md:py-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 40, rotateX: 20 }}
        animate={{ scale: 1, y: 0, rotateX: 0 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.35 }}
        className={`relative w-full rounded-[1.5rem] md:rounded-[2rem] border-[3px] md:border-[4px] border-white/70 bg-gradient-to-br from-[#1d4ed8] via-[#3b82f6] to-[#60a5fa] p-3 landscape:p-2.5 md:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] flex flex-col max-h-[96dvh] landscape:max-h-[98dvh] md:max-h-[90dvh] ${
          SIZE_CLASSES[size]
        }`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header — compact but legible in landscape */}
        <div className="flex items-center justify-between gap-3 shrink-0 mb-2 landscape:mb-1.5 md:mb-4">
          <div>
            {subtitle && (
              <p className="text-[10px] landscape:text-[10px] md:text-xs font-bold uppercase tracking-[0.28em] text-white/80">
                {subtitle}
              </p>
            )}
            <h2 className="font-display text-2xl landscape:text-lg uppercase tracking-[0.08em] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)] md:text-3xl leading-none">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-2 border-white bg-gray-800 p-1.5 text-white transition hover:bg-gray-700 shrink-0"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
};
