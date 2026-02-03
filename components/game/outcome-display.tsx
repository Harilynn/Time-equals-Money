'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Decision, MARKET_INSTRUMENTS, FINANCIAL_CONCEPTS, getConceptExplanation, calculateEV, formatTimeString } from '@/lib/game-engine';
import { useGame } from '@/lib/game-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, BookOpen, Lightbulb, AlertTriangle, CheckCircle, XCircle, ArrowRight, Skull, Heart, Trophy } from 'lucide-react';

interface OutcomeDisplayProps {
  decision: Decision;
  onContinue: () => void;
}

export function OutcomeDisplay({ decision, onContinue }: OutcomeDisplayProps) {
  const { state, playerTitle } = useGame();
  const [showFlash, setShowFlash] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const autoCloseDelayMs = 3500;
  const instrument = MARKET_INSTRUMENTS.find((i) => i.id === decision.instrumentId)!;
  const conceptExplanation = getConceptExplanation(instrument, decision);
  const concept = FINANCIAL_CONCEPTS[instrument.concept as keyof typeof FINANCIAL_CONCEPTS];
  const ev = calculateEV(instrument.outcomes);

  const isProfit = decision.netChange > 0;
  const isLoss = decision.netChange < 0;
  const evDifference = decision.actualValue - decision.expectedValue;

  useEffect(() => {
    setCanContinue(false);
    setShowFlash(true);
    setShowDetails(false);
    const timer = setTimeout(() => setShowFlash(false), 1400);
    const detailsTimer = setTimeout(() => setShowDetails(true), 1800);
    const unlockTimer = setTimeout(() => setCanContinue(true), 2000);
    const autoCloseTimer = setTimeout(() => onContinue(), autoCloseDelayMs);
    return () => {
      clearTimeout(timer);
      clearTimeout(detailsTimer);
      clearTimeout(unlockTimer);
      clearTimeout(autoCloseTimer);
    };
  }, [decision, onContinue]);

  return (
    <div className="space-y-4">
      {showFlash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.75, 0] }}
          transition={{ duration: 1.4, ease: 'easeOut' }}
          className={cn(
            'pointer-events-none fixed inset-0 z-40',
            isProfit ? 'bg-success/40' : 'bg-danger/40'
          )}
        />
      )}

      {/* Main Result Modal - Clean and Dramatic */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="space-y-6 rounded-lg border-2 border-border bg-card p-8"
      >
        {/* Outcome Header with Icon */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className={cn(
              'mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full',
              isProfit ? 'bg-success/20' : 'bg-danger/20'
            )}
          >
            {isProfit ? (
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: 3 }}>
                <Heart className="h-12 w-12 text-success" />
              </motion.div>
            ) : (
              <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.3, repeat: 3 }}>
                <Skull className="h-12 w-12 text-danger" />
              </motion.div>
            )}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-3 text-3xl font-bold text-foreground"
          >
            {decision.outcome.label}
          </motion.h2>

          {/* Time Change - Prominent Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-4"
          >
            <span className={cn('font-mono text-6xl font-bold', isProfit ? 'text-success' : 'text-danger')}>
              {isProfit ? '+' : '-'}{formatTimeString(Math.abs(decision.netChange))}
            </span>
          </motion.div>

          <p className="mb-6 text-base text-muted-foreground">{decision.outcome.description}</p>

          {/* Life Impact Statement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={cn(
              'rounded-lg p-4 mb-6',
              isProfit ? 'bg-success/10 border border-success/30' : 'bg-danger/10 border border-danger/30'
            )}
          >
            <p className={cn('text-lg font-semibold', isProfit ? 'text-success' : 'text-danger')}>
              {isProfit ? (
                <>You <span className="font-bold">gained</span> {formatTimeString(Math.abs(decision.netChange))} days of life</>
              ) : (
                <>You <span className="font-bold">lost</span> {formatTimeString(Math.abs(decision.netChange))} days of your life</>
              )}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Your remaining lifetime: <span className="font-bold text-foreground text-base">{formatTimeString(state.timeRemaining)}</span>
            </p>
          </motion.div>
        </div>

        {/* Educational Section - Revealed after dramatic effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={showDetails ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn('space-y-4 border-t border-border pt-6', !showDetails && 'hidden')}
        >
          {/* Trade Summary */}
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
            <h3 className="mb-3 font-bold text-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-warning" />
              Trade Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Staked</div>
                <div className="font-mono text-lg font-bold text-danger">-{formatTimeString(decision.stake)}</div>
              </div>
              <div className="rounded bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Returned</div>
                <div className={cn('font-mono text-lg font-bold', decision.actualValue >= 0 ? 'text-success' : 'text-danger')}>
                  {decision.actualValue >= 0 ? '+' : ''}{formatTimeString(decision.stake + decision.actualValue)}
                </div>
              </div>
            </div>
          </div>

          {/* Concept Explanation */}
          <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-foreground">What Happened?</h3>
            </div>

            <div className="mb-4 flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-4 w-4 text-warning" />
              <div>
                <span className="font-medium text-foreground">{conceptExplanation.conceptUsed}</span>
                <p className="text-sm text-muted-foreground">{conceptExplanation.explanation}</p>
              </div>
            </div>

            <div className="mb-4 rounded bg-card/50 p-3">
              <div className="mb-1 text-xs text-muted-foreground">Formula:</div>
              <code className="font-mono text-sm text-primary">{concept.formula}</code>
            </div>

            <div className={cn('flex items-start gap-2 rounded p-3', decision.wasOptimal ? 'bg-success/10' : 'bg-warning/10')}>
              {decision.wasOptimal ? (
                <CheckCircle className="mt-0.5 h-4 w-4 text-success" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 text-warning" />
              )}
              <div>
                <span className={cn('font-medium', decision.wasOptimal ? 'text-success' : 'text-warning')}>
                  {decision.wasOptimal ? 'Good Decision!' : 'Room for Improvement'}
                </span>
                <p className="text-sm text-muted-foreground">{conceptExplanation.improvement}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Continue Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={onContinue} className="w-full gap-2" size="lg" disabled={!canContinue}>
            Continue to Round {state.currentRound + 1}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
