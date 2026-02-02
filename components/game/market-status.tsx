'use client';

import { motion } from 'framer-motion';
import { useGame } from '@/lib/game-context';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Activity, Minus } from 'lucide-react';

const marketIcons = {
  bull: TrendingUp,
  bear: TrendingDown,
  volatile: Activity,
  stable: Minus,
};

const marketColors = {
  bull: 'text-success border-success/50 bg-success/10',
  bear: 'text-danger border-danger/50 bg-danger/10',
  volatile: 'text-warning border-warning/50 bg-warning/10',
  stable: 'text-muted-foreground border-border bg-muted/50',
};

const marketLabels = {
  bull: 'Bull Market',
  bear: 'Bear Market',
  volatile: 'High Volatility',
  stable: 'Stable',
};

export function MarketStatus() {
  const { state, hotStreakInfo } = useGame();
  const { marketCondition, streak, volatilityMultiplier, currentRound, maxRounds, playerLevel, riskExposure } = state;

  const Icon = marketIcons[marketCondition];

  return (
    <div className="space-y-3">
      {/* Round Counter */}
      <div className="flex items-center justify-between rounded border border-border bg-card px-4 py-2">
        <span className="text-sm text-muted-foreground">Round</span>
        <span className="font-mono text-lg font-bold text-foreground">
          {currentRound} / {maxRounds}
        </span>
      </div>

      {/* Market Condition */}
      <motion.div
        key={marketCondition}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={cn('flex items-center justify-between rounded border px-4 py-2', marketColors[marketCondition])}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span className="text-sm font-medium">{marketLabels[marketCondition]}</span>
        </div>
        <span className="text-xs opacity-75">Market adapts to your strategy</span>
      </motion.div>

      {/* Hot Streak Warning */}
      {hotStreakInfo.isTrap && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'rounded border px-4 py-2 text-center text-sm',
            hotStreakInfo.isHot ? 'border-warning/50 bg-warning/10 text-warning' : 'border-danger/50 bg-danger/10 text-danger'
          )}
        >
          {hotStreakInfo.message}
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded border border-border bg-card px-3 py-2">
          <div className="text-xs text-muted-foreground">Level</div>
          <div className="font-mono text-lg font-bold text-primary">{playerLevel}</div>
        </div>
        <div className="rounded border border-border bg-card px-3 py-2">
          <div className="text-xs text-muted-foreground">Streak</div>
          <div
            className={cn('font-mono text-lg font-bold', streak > 0 ? 'text-success' : streak < 0 ? 'text-danger' : 'text-muted-foreground')}
          >
            {streak > 0 ? `+${streak}` : streak}
          </div>
        </div>
        <div className="rounded border border-border bg-card px-3 py-2">
          <div className="text-xs text-muted-foreground">Volatility</div>
          <div className={cn('font-mono text-lg font-bold', volatilityMultiplier > 1.5 ? 'text-warning' : 'text-foreground')}>
            {volatilityMultiplier.toFixed(2)}x
          </div>
        </div>
        <div className="rounded border border-border bg-card px-3 py-2">
          <div className="text-xs text-muted-foreground">Risk Exposure</div>
          <div className={cn('font-mono text-lg font-bold', riskExposure > 0.5 ? 'text-danger' : 'text-foreground')}>
            {(riskExposure * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}
