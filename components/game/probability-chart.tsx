'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { MarketInstrument, calculateEV, formatTimeString } from '@/lib/game-engine';
import { cn } from '@/lib/utils';

interface ProbabilityChartProps {
  instrument: MarketInstrument;
  stake: number;
}

export function ProbabilityChart({ instrument, stake }: ProbabilityChartProps) {
  const ev = calculateEV(instrument.outcomes);

  const chartData = useMemo(() => {
    return instrument.outcomes.map((outcome) => ({
      label: outcome.label,
      probability: outcome.probability * 100,
      value: Math.round(stake * outcome.multiplier),
      multiplier: outcome.multiplier,
    }));
  }, [instrument.outcomes, stake]);

  const maxValue = Math.max(...chartData.map((d) => Math.abs(d.value)));

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="font-medium text-foreground">Probability Distribution</h4>
        <div className={cn('font-mono text-sm font-bold', ev >= 0 ? 'text-success' : 'text-danger')}>
          EV: {ev >= 0 ? '+' : ''}
          {(ev * 100).toFixed(1)}%
        </div>
      </div>

      <div className="space-y-3">
        {chartData.map((item, idx) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{item.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{item.probability.toFixed(0)}%</span>
                <span className={cn('font-mono font-bold', item.value >= 0 ? 'text-success' : 'text-danger')}>
                  {item.value >= 0 ? '+' : '-'}{formatTimeString(Math.abs(item.value))}
                </span>
              </div>
            </div>
            <div className="flex h-4 overflow-hidden rounded-full bg-muted">
              {/* Probability bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.probability}%` }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={cn(
                  'h-full',
                  item.multiplier > 0.3 && 'bg-success',
                  item.multiplier > 0 && item.multiplier <= 0.3 && 'bg-success/60',
                  item.multiplier === 0 && 'bg-muted-foreground',
                  item.multiplier < 0 && item.multiplier > -0.5 && 'bg-warning',
                  item.multiplier <= -0.5 && 'bg-danger'
                )}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Expected Value Indicator */}
      <div className="mt-4 border-t border-border pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Expected Return</span>
          <motion.span
            key={stake}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn('font-mono text-lg font-bold', ev >= 0 ? 'text-success' : 'text-danger')}
          >
            {Math.round(stake * ev) >= 0 ? '+' : '-'}{formatTimeString(Math.abs(Math.round(stake * ev)))}
          </motion.span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          This is the average outcome if you made this trade infinitely many times.
        </p>
      </div>
    </div>
  );
}
