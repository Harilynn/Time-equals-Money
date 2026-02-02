'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRandomIdleHint } from '@/lib/game-engine';
import { useGame } from '@/lib/game-context';
import { Lightbulb, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const IDLE_THRESHOLD = 8000; // Show hint after 8 seconds of inactivity
const HINT_DURATION = 15000; // Auto-hide after 15 seconds

export function IdleHint() {
  const { state, updateIdleTime, resetActivity } = useGame();
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState(getRandomIdleHint());

  useEffect(() => {
    if (state.isGameOver || state.currentRound === 0) return;

    const checkIdle = setInterval(() => {
      const idleTime = Date.now() - state.lastActivityTimestamp;
      updateIdleTime(idleTime);

      if (idleTime >= IDLE_THRESHOLD && !showHint) {
        setHint(getRandomIdleHint());
        setShowHint(true);
      }
    }, 1000);

    return () => clearInterval(checkIdle);
  }, [state.lastActivityTimestamp, state.isGameOver, state.currentRound, showHint, updateIdleTime]);

  // Auto-hide hint
  useEffect(() => {
    if (!showHint) return;

    const hideTimer = setTimeout(() => {
      setShowHint(false);
    }, HINT_DURATION);

    return () => clearTimeout(hideTimer);
  }, [showHint]);

  const handleDismiss = () => {
    setShowHint(false);
    resetActivity();
  };

  return (
    <AnimatePresence>
      {showHint && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-6 left-1/2 z-50 w-full max-w-md -translate-x-1/2 px-4"
        >
          <div className="relative rounded-lg border-2 border-primary bg-card p-4 shadow-2xl shadow-primary/20">
            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDismiss}
              className="absolute right-2 top-2 h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>

            {/* Header */}
            <div className="mb-2 flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <Lightbulb className="h-5 w-5 text-warning" />
              </motion.div>
              <span className="text-xs font-bold uppercase tracking-wider text-warning">
                Finance Tip
              </span>
            </div>

            {/* Hint Content */}
            <h4 className="mb-1 font-bold text-foreground">{hint.title}</h4>
            <p className="text-sm text-muted-foreground">{hint.hint}</p>

            {/* Progress Bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: HINT_DURATION / 1000, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 rounded-b-lg bg-primary"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
