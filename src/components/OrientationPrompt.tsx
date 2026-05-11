import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone } from 'lucide-react';

export function OrientationPrompt() {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if it's a mobile device (touch support) and width < height
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const portrait = window.innerHeight > window.innerWidth;
      
      // We only want to show this on mobile devices in portrait mode
      if (isTouch && portrait && window.innerWidth <= 768) {
        setIsPortrait(true);
      } else {
        setIsPortrait(false);
      }
    };

    // Initial check
    checkOrientation();

    // Add event listeners
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  return (
    <AnimatePresence>
      {isPortrait && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-md p-6 text-center"
        >
          <motion.div
            animate={{ rotate: 90 }}
            transition={{
              repeat: Infinity,
              repeatType: 'reverse',
              duration: 1.5,
              ease: 'easeInOut',
              repeatDelay: 0.5
            }}
            className="mb-8 p-4 bg-white/10 rounded-full border border-white/20"
          >
            <Smartphone size={64} className="text-white" />
          </motion.div>
          
          <h2 className="font-display text-4xl text-white mb-4 tracking-wider text-3d">
            PLEASE ROTATE
          </h2>
          
          <p className="text-slate-200 text-lg max-w-xs font-medium">
            This game is designed to be played in landscape mode. Please rotate your device for the best experience.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
