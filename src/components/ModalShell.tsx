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
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 40, rotateX: 20 }}
        animate={{ scale: 1, y: 0, rotateX: 0 }}
        exit={{ scale: 0.9, y: 30, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.35 }}
        className={`relative w-full rounded-[2rem] border-[4px] border-white/70 bg-gradient-to-br from-[#1d4ed8] via-[#3b82f6] to-[#60a5fa] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.45)] ${
          SIZE_CLASSES[size]
        }`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {subtitle && (
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">
                {subtitle}
              </p>
            )}
            <h2 className="font-display text-2xl uppercase tracking-[0.08em] text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.45)] md:text-3xl">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border-2 border-white/80 bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6">{children}</div>
      </motion.div>
    </motion.div>
  );
};
