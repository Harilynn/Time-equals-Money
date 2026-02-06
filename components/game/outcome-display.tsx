'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Decision, MARKET_INSTRUMENTS, FINANCIAL_CONCEPTS, getConceptExplanation, calculateEV, formatTimeString, SeededRandom } from '@/lib/game-engine';
import { useGame } from '@/lib/game-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Leaderboard } from '@/components/game/leaderboard';
import { TrendingUp, TrendingDown, BookOpen, Lightbulb, AlertTriangle, CheckCircle, XCircle, ArrowRight, Skull, Heart, Trophy, X, Droplet, Plus } from 'lucide-react';

interface OutcomeDisplayProps {
  decision: Decision;
  onContinue: () => void;
}

export function OutcomeDisplay({ decision, onContinue }: OutcomeDisplayProps) {
  const { state, playerTitle } = useGame();
  const [showFlash, setShowFlash] = useState(false);
  const [canContinue, setCanContinue] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const instrument = MARKET_INSTRUMENTS.find((i) => i.id === decision.instrumentId)!;
  const conceptExplanation = getConceptExplanation(instrument, decision);
  const concept = FINANCIAL_CONCEPTS[instrument.concept as keyof typeof FINANCIAL_CONCEPTS];
  const ev = calculateEV(instrument.outcomes);

  const isProfit = decision.netChange > 0;
  const isLoss = decision.netChange < 0;
  const evDifference = decision.actualValue - decision.expectedValue;

  const rainItems = (() => {
    const rng = new SeededRandom(decision.round * 100000 + decision.stake);
    const count = isProfit ? 28 : 18;
    return Array.from({ length: count }, (_, index) => ({
      id: index,
      left: rng.next() * 100,
      size: 14 + rng.next() * 18,
      delay: rng.next() * 0.8,
      duration: 1.2 + rng.next() * 0.9,
      rotate: rng.next() * 180,
      drift: (rng.next() - 0.5) * 40,
    }));
  })();

  const RainIcon = isProfit ? Plus : Droplet;

  const getOutcomeReason = () => {
    if (isProfit) {
      if (evDifference >= 0) {
        return 'Your outcome landed above the expected value, which amplified your gains.';
      }
      return 'You still profited, but the outcome landed below the expected value.';
    }
    if (isLoss) {
      if (decision.expectedValue < 0) {
        return 'This trade had negative expected value. The risk outweighed the reward.';
      }
      return 'Variance went against you; the outcome fell below the expected value.';
    }
    return 'The outcome matched the expected value, resulting in no net change.';
  };

  const getWinGuidance = () => {
    if (!isProfit) return null;
    if (decision.stake / state.timeRemaining > 0.5) {
      return 'You won, but the stake was oversized. Consider scaling down to protect your remaining time.';
    }
    return 'Your sizing aligned with the odds. Keep risk proportional to your remaining time.';
  };

  const getLossGuidance = () => {
    if (!isLoss) return null;
    if (decision.stake / state.timeRemaining > 0.5) {
      return 'The loss was amplified by an oversized stake. Reduce position size on high volatility trades.';
    }
    if (decision.expectedValue < 0) {
      return 'Avoid negative expected value setups unless the downside is limited or hedged.';
    }
    return 'Your setup was reasonable, but variance hit. Consider diversifying across lower-risk instruments.';
  };

  useEffect(() => {
    setCanContinue(false);
    setShowFlash(true);
    setShowDetails(false);
    setShowPopup(true);
    const timer = setTimeout(() => setShowFlash(false), 1400);
    const detailsTimer = setTimeout(() => setShowDetails(true), 1800);
    const unlockTimer = setTimeout(() => setCanContinue(true), 2000);
    return () => {
      clearTimeout(timer);
      clearTimeout(detailsTimer);
      clearTimeout(unlockTimer);
    };
  }, [decision, onContinue]);

  return (
    <div className="min-h-screen max-h-screen w-full space-y-6 overflow-y-auto px-4 py-6 md:px-10">
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

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            {rainItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -40, x: 0, rotate: 0 }}
                animate={{ opacity: [0, 0.9, 0.9, 0], y: '120%', x: item.drift, rotate: item.rotate }}
                transition={{ duration: item.duration, delay: item.delay, ease: 'easeOut' }}
                style={{ left: `${item.left}%`, width: item.size, height: item.size }}
                className="absolute top-0"
              >
                <RainIcon className={cn('h-full w-full', isProfit ? 'text-success/70' : 'text-danger/70')} />
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="relative w-full max-w-xl rounded-xl border-2 border-border bg-card p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="absolute right-3 top-3 rounded-full border border-border bg-muted/60 p-2 text-muted-foreground transition hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-4">
              <div className={cn('flex h-14 w-14 items-center justify-center rounded-full', isProfit ? 'bg-success/20' : 'bg-danger/20')}>
                {isProfit ? <TrendingUp className="h-7 w-7 text-success" /> : <TrendingDown className="h-7 w-7 text-danger" />}
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Round Result</div>
                <div className="text-xl font-bold text-foreground">{decision.outcome.label}</div>
                <div className={cn('font-mono text-2xl font-bold', isProfit ? 'text-success' : 'text-danger')}>
                  {isProfit ? '+' : '-'}{formatTimeString(Math.abs(decision.netChange))}
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Dismiss this overlay to review the full breakdown and continue.</p>
          </motion.div>
        </div>
      )}

      {/* Main Result Screen */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="space-y-8 rounded-lg border-2 border-border bg-card p-6 md:p-8"
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
                <p className="mt-2 text-sm text-muted-foreground">{getOutcomeReason()}</p>
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

          {/* Win/Loss Guidance */}
          {isLoss && (
            <div className={cn('rounded-lg border p-4', 'border-danger/40 bg-danger/5')}>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <XCircle className="h-4 w-4 text-danger" />
                If You Lost
              </div>
              <p className="text-sm text-muted-foreground">{getLossGuidance()}</p>
            </div>
          )}
          {isProfit && (
            <div className={cn('rounded-lg border p-4', 'border-success/40 bg-success/5')}>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle className="h-4 w-4 text-success" />
                If You Won
              </div>
              <p className="text-sm text-muted-foreground">{getWinGuidance()}</p>
            </div>
          )}

          {/* Market Reaction / Signals */}
          {decision.marketBias && decision.marketBias.reasons.length > 0 && (
            <div className="rounded-lg border border-border bg-card/50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Market Reaction
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {decision.marketBias.reasons.map((reason) => (
                  <li key={reason}>• {reason}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>

        {/* Continue Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={onContinue} className="w-full gap-2" size="lg" disabled={!canContinue}>
            Continue to Round {state.currentRound + 1}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Leaderboard Section */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Trophy className="h-4 w-4 text-primary" />
          Leaderboard (Post-Result)
        </div>
        <Leaderboard currentScore={state.score} currentTitle={playerTitle} />
      </div>
    </div>
  );
}
