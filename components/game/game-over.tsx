'use client';

import { motion } from 'framer-motion';
import { useGame } from '@/lib/game-context';
import { MARKET_INSTRUMENTS, FINANCIAL_CONCEPTS, calculateScore } from '@/lib/game-engine';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Trophy, Skull, TrendingUp, TrendingDown, BookOpen, AlertTriangle, RotateCcw, Share2 } from 'lucide-react';

export function GameOver() {
  const { state, resetGame, playerTitle } = useGame();
  const { isVictory, timeRemaining, totalTimeEarned, totalTimeLost, decisions, conceptsLearned } = state;

  const score = calculateScore(state);
  const winRate = decisions.filter((d) => d.netChange > 0).length / Math.max(1, decisions.length);
  const optimalRate = decisions.filter((d) => d.wasOptimal).length / Math.max(1, decisions.length);
  const avgRisk =
    decisions.reduce((sum, d) => {
      const inst = MARKET_INSTRUMENTS.find((i) => i.id === d.instrumentId);
      return sum + (inst?.riskLevel === 'extreme' ? 4 : inst?.riskLevel === 'high' ? 3 : inst?.riskLevel === 'medium' ? 2 : 1);
    }, 0) / Math.max(1, decisions.length);

  // Find biggest mistakes
  const biggestLoss = decisions.reduce((worst, d) => (d.netChange < (worst?.netChange ?? 0) ? d : worst), decisions[0]);
  const suboptimalDecisions = decisions.filter((d) => !d.wasOptimal);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          <div
            className={cn(
              'mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full',
              isVictory ? 'bg-success/20' : 'bg-danger/20'
            )}
          >
            {isVictory ? (
              <Trophy className="h-12 w-12 text-success" />
            ) : (
              <Skull className="h-12 w-12 text-danger" />
            )}
          </div>

          <h1 className={cn('text-4xl font-bold', isVictory ? 'text-success' : 'text-danger')}>
            {isVictory ? 'VICTORY' : 'TIME EXPIRED'}
          </h1>

          <p className="mt-2 text-lg text-muted-foreground">
            {isVictory ? 'You survived the market!' : 'Your lifetime has reached zero.'}
          </p>

          <div className="mt-4 inline-block rounded-lg bg-primary/10 px-6 py-3">
            <span className="text-sm text-muted-foreground">Title Earned:</span>
            <div className="text-2xl font-bold text-primary">{playerTitle}</div>
          </div>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border-2 border-primary bg-card p-6"
        >
          <div className="mb-4 text-center">
            <span className="text-sm text-muted-foreground">Final Score</span>
            <div className="font-mono text-5xl font-bold text-primary">{score.toLocaleString()}</div>
          </div>

          <div className="mb-4 rounded bg-muted/50 p-3 text-center text-xs text-muted-foreground">
            Score = (Time × Risk Efficiency × Concept Accuracy) - Time Lost - Volatility Penalties
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded bg-muted/50 p-3 text-center">
              <div className="text-xs text-muted-foreground">Time Remaining</div>
              <div className={cn('font-mono text-xl font-bold', timeRemaining > 0 ? 'text-success' : 'text-danger')}>
                {timeRemaining}
              </div>
            </div>
            <div className="rounded bg-muted/50 p-3 text-center">
              <div className="text-xs text-muted-foreground">Total Earned</div>
              <div className="font-mono text-xl font-bold text-success">+{totalTimeEarned}</div>
            </div>
            <div className="rounded bg-muted/50 p-3 text-center">
              <div className="text-xs text-muted-foreground">Total Lost</div>
              <div className="font-mono text-xl font-bold text-danger">-{totalTimeLost}</div>
            </div>
            <div className="rounded bg-muted/50 p-3 text-center">
              <div className="text-xs text-muted-foreground">Net P&L</div>
              <div className={cn('font-mono text-xl font-bold', totalTimeEarned - totalTimeLost >= 0 ? 'text-success' : 'text-danger')}>
                {totalTimeEarned - totalTimeLost >= 0 ? '+' : ''}
                {totalTimeEarned - totalTimeLost}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Performance Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-border bg-card p-6"
        >
          <h3 className="mb-4 font-bold text-foreground">Performance Analysis</h3>

          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">Win Rate</span>
                <span className={cn('font-mono font-bold', winRate >= 0.5 ? 'text-success' : 'text-danger')}>
                  {(winRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${winRate * 100}%` }}
                  transition={{ delay: 0.5 }}
                  className={cn('h-full', winRate >= 0.5 ? 'bg-success' : 'bg-danger')}
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-muted-foreground">Optimal Decisions</span>
                <span className={cn('font-mono font-bold', optimalRate >= 0.6 ? 'text-success' : 'text-warning')}>
                  {(optimalRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${optimalRate * 100}%` }}
                  transition={{ delay: 0.6 }}
                  className={cn('h-full', optimalRate >= 0.6 ? 'bg-success' : 'bg-warning')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Avg Risk Level</div>
                <div className={cn('font-mono text-lg font-bold', avgRisk > 3 ? 'text-danger' : avgRisk > 2 ? 'text-warning' : 'text-success')}>
                  {avgRisk.toFixed(1)} / 4
                </div>
              </div>
              <div className="rounded bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">Trades Made</div>
                <div className="font-mono text-lg font-bold text-foreground">{decisions.length}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Post-Mortem Analysis */}
        {!isVictory && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-lg border-2 border-danger/50 bg-danger/5 p-6"
          >
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-danger" />
              <h3 className="font-bold text-danger">What Went Wrong</h3>
            </div>

            {biggestLoss && biggestLoss.netChange < 0 && (
              <div className="mb-4 rounded bg-card/50 p-4">
                <div className="text-sm font-medium text-danger">Biggest Loss: Round {biggestLoss.round}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Lost {Math.abs(biggestLoss.netChange)} units on {MARKET_INSTRUMENTS.find((i) => i.id === biggestLoss.instrumentId)?.name}.
                  {!biggestLoss.wasOptimal && ' This was a suboptimal position size.'}
                </div>
              </div>
            )}

            {suboptimalDecisions.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-foreground">
                  Key Mistakes ({suboptimalDecisions.length} suboptimal decisions):
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {suboptimalDecisions.slice(0, 3).map((d, i) => {
                    const inst = MARKET_INSTRUMENTS.find((m) => m.id === d.instrumentId);
                    const concept = FINANCIAL_CONCEPTS[inst?.concept as keyof typeof FINANCIAL_CONCEPTS];
                    return (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-danger">-</span>
                        <span>
                          Round {d.round}: Ignored {concept?.name || 'risk management'}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </motion.div>
        )}

        {/* Concepts Learned */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg border border-border bg-card p-6"
        >
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Concepts Mastered</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {conceptsLearned.map((concept) => (
              <span key={concept} className="rounded bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {FINANCIAL_CONCEPTS[concept as keyof typeof FINANCIAL_CONCEPTS]?.name || concept}
              </span>
            ))}
            {conceptsLearned.length === 0 && <span className="text-sm text-muted-foreground">No concepts mastered yet. Keep practicing!</span>}
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            {conceptsLearned.length} / {Object.keys(FINANCIAL_CONCEPTS).length} concepts discovered
          </p>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={resetGame} size="lg" className="flex-1 gap-2">
            <RotateCcw className="h-4 w-4" />
            Play Again
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 bg-transparent"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'TIME IS THE MARKET',
                  text: `I scored ${score.toLocaleString()} as "${playerTitle}" in TIME IS THE MARKET! Can you beat it?`,
                });
              }
            }}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
