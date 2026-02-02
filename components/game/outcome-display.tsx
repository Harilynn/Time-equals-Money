'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Decision, MARKET_INSTRUMENTS, FINANCIAL_CONCEPTS, getConceptExplanation, calculateEV, formatTimeString } from '@/lib/game-engine';
import { useGame } from '@/lib/game-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Leaderboard } from './leaderboard';
import { TrendingUp, TrendingDown, BookOpen, Lightbulb, AlertTriangle, CheckCircle, XCircle, ArrowRight, Skull, Heart, Trophy } from 'lucide-react';

interface OutcomeDisplayProps {
  decision: Decision;
  onContinue: () => void;
}

export function OutcomeDisplay({ decision, onContinue }: OutcomeDisplayProps) {
  const { state, playerTitle } = useGame();
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const instrument = MARKET_INSTRUMENTS.find((i) => i.id === decision.instrumentId)!;
  const conceptExplanation = getConceptExplanation(instrument, decision);
  const concept = FINANCIAL_CONCEPTS[instrument.concept as keyof typeof FINANCIAL_CONCEPTS];
  const ev = calculateEV(instrument.outcomes);

  const isProfit = decision.netChange > 0;
  const isLoss = decision.netChange < 0;
  const evDifference = decision.actualValue - decision.expectedValue;

  return (
    <div className="space-y-6">
      {/* Main Result Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="space-y-6 rounded-lg border-2 border-border bg-card p-6"
      >
        {/* Outcome Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className={cn(
              'mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full',
              isProfit ? 'bg-success/20' : 'bg-danger/20'
            )}
          >
            {isProfit ? (
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 0.5, repeat: 3 }}>
                <Heart className="h-10 w-10 text-success" />
              </motion.div>
            ) : (
              <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.3, repeat: 3 }}>
                <Skull className="h-10 w-10 text-danger" />
              </motion.div>
            )}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-2 text-2xl font-bold text-foreground"
          >
            {decision.outcome.label}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-2"
          >
            <span className={cn('font-mono text-5xl font-bold', isProfit ? 'text-success' : 'text-danger')}>
              {isProfit ? '+' : '-'}{formatTimeString(Math.abs(decision.netChange))}
            </span>
          </motion.div>

          <p className="text-sm text-muted-foreground">{decision.outcome.description}</p>

          {/* Life Impact Statement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={cn(
              'mt-4 rounded-lg p-4',
              isProfit ? 'bg-success/10' : 'bg-danger/10'
            )}
          >
            <p className={cn('text-lg', isProfit ? 'text-success' : 'text-danger')}>
              {isProfit ? (
                <>You just <span className="font-bold">gained</span> {formatTimeString(Math.abs(decision.netChange))} of life</>
              ) : (
                <>You just <span className="font-bold">lost</span> {formatTimeString(Math.abs(decision.netChange))} of your life</>
              )}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Remaining lifetime: <span className="font-bold text-foreground">{formatTimeString(state.timeRemaining)}</span>
            </p>
          </motion.div>
        </div>

        {/* Trade Summary - Showing the staking mechanics */}
        <div className="rounded-lg border-2 border-warning/30 bg-warning/5 p-4">
          <h3 className="mb-3 font-bold text-foreground flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-warning" />
            Trade Breakdown
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">💸 Staked (Invested)</div>
              <div className="font-mono text-lg font-bold text-danger">-{formatTimeString(decision.stake)}</div>
              <div className="text-xs text-muted-foreground mt-1">Your risk/investment</div>
            </div>
            <div className="rounded bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">📊 Returned</div>
              <div className={cn('font-mono text-lg font-bold', decision.actualValue >= 0 ? 'text-success' : 'text-danger')}>
                {decision.actualValue >= 0 ? '+' : ''}{formatTimeString(decision.stake + decision.actualValue)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">What you got back</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Expected Return</div>
              <div className={cn('font-mono text-base font-bold', decision.expectedValue >= 0 ? 'text-success' : 'text-danger')}>
                {decision.expectedValue >= 0 ? '+' : ''}{formatTimeString(decision.expectedValue)}
              </div>
            </div>
            <div className="rounded bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground">Net Profit/Loss</div>
              <div className={cn('font-mono text-base font-bold', decision.netChange >= 0 ? 'text-success' : 'text-danger')}>
                {decision.netChange >= 0 ? '+' : ''}{formatTimeString(decision.netChange)}
              </div>
            </div>
          </div>
          <div className="mt-3 p-2 rounded bg-card text-xs text-center text-muted-foreground">
            💡 You invested {formatTimeString(decision.stake)} → Got back {formatTimeString(decision.stake + decision.actualValue)} → Net: {decision.netChange >= 0 ? '+' : ''}{formatTimeString(decision.netChange)}
          </div>
        </div>

        {/* Luck vs Skill */}
        <div className="rounded border border-border bg-card/50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Outcome vs Expectation</span>
            <span className={cn('text-sm font-bold', evDifference >= 0 ? 'text-success' : 'text-danger')}>
              {evDifference >= 0 ? 'Lucky' : 'Unlucky'}: {evDifference >= 0 ? '+' : '-'}{formatTimeString(Math.abs(evDifference))}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: '50%' }}
              animate={{ width: `${Math.max(5, Math.min(95, 50 + (evDifference / decision.stake) * 50))}%` }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className={cn('h-full', evDifference >= 0 ? 'bg-success' : 'bg-danger')}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {evDifference >= 0
              ? "You got better than expected. Don't confuse luck with skill."
              : "You got worse than expected. A bad outcome doesn't always mean a bad decision."}
          </p>
        </div>

        {/* Educational Panel */}
        <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">What Just Happened?</h3>
          </div>

          <div className="mb-4 space-y-2">
            <div className="flex items-start gap-2">
              <Lightbulb className="mt-0.5 h-4 w-4 text-warning" />
              <div>
                <span className="font-medium text-foreground">{conceptExplanation.conceptUsed}</span>
                <p className="text-sm text-muted-foreground">{conceptExplanation.explanation}</p>
              </div>
            </div>
          </div>

          <div className="mb-4 rounded bg-card/50 p-3">
            <div className="mb-1 text-xs text-muted-foreground">Key Formula:</div>
            <code className="font-mono text-sm text-primary">{concept.formula}</code>
            <p className="mt-1 text-xs text-muted-foreground">{concept.description}</p>
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

          {/* Quick Stats */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded bg-card/50 p-2">
              <span className="text-xs text-muted-foreground">Trade EV: </span>
              <span className={cn('font-mono font-bold', ev >= 0 ? 'text-success' : 'text-danger')}>
                {ev >= 0 ? '+' : ''}{(ev * 100).toFixed(1)}%
              </span>
            </div>
            <div className="rounded bg-card/50 p-2">
              <span className="text-xs text-muted-foreground">Kelly Suggestion: </span>
              <span className="font-mono text-primary">
                {ev > 0 ? `${Math.min(25, Math.round(ev * 50))}% max` : 'Avoid'}
              </span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={onContinue} className="w-full gap-2" size="lg">
            Continue to Round {state.currentRound + 1}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Leaderboard Section - Separate and Prominent */}
      {showLeaderboard && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
            </div>
            <button
              onClick={() => setShowLeaderboard(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Hide
            </button>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            See how you rank among the top traders. Survive longer and make smarter decisions to climb higher!
          </p>
          <Leaderboard currentScore={state.score} currentTitle={playerTitle} />
        </motion.div>
      )}

      {!showLeaderboard && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowLeaderboard(true)}
          className="w-full rounded-lg border-2 border-primary/30 bg-primary/5 p-4 hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
        >
          <Trophy className="h-5 w-5 text-primary" />
          <span className="font-semibold text-primary">Show Leaderboard</span>
        </motion.button>
      )}
    </div>
  );
}
