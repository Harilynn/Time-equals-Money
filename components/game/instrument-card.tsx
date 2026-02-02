'use client';

import { motion } from 'framer-motion';
import { MarketInstrument, calculateEV, calculateVolatility, getWorstCase, getBestCase, formatTimeString } from '@/lib/game-engine';
import { cn } from '@/lib/utils';
import { Lock, TrendingUp, TrendingDown, AlertTriangle, Shield, Zap, Skull } from 'lucide-react';

const riskColors = {
  low: 'border-success/50 bg-success/5 hover:border-success hover:bg-success/10',
  medium: 'border-warning/50 bg-warning/5 hover:border-warning hover:bg-warning/10',
  high: 'border-danger/50 bg-danger/5 hover:border-danger hover:bg-danger/10',
  extreme: 'border-danger bg-danger/10 hover:bg-danger/20',
};

const riskIcons = {
  low: Shield,
  medium: AlertTriangle,
  high: Zap,
  extreme: Skull,
};

const riskLabels = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  extreme: 'EXTREME',
};

interface InstrumentCardProps {
  instrument: MarketInstrument;
  isLocked: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export function InstrumentCard({ instrument, isLocked, isSelected, onClick }: InstrumentCardProps) {
  const ev = calculateEV(instrument.outcomes);
  const volatility = calculateVolatility(instrument.outcomes);
  const worstCase = getWorstCase(instrument.outcomes);
  const bestCase = getBestCase(instrument.outcomes);

  const RiskIcon = riskIcons[instrument.riskLevel];

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-muted/30 p-4 opacity-50">
        <Lock className="mb-2 h-8 w-8 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">{instrument.name}</span>
        <span className="text-xs text-muted-foreground">Unlocks at Level {instrument.unlockLevel}</span>
      </div>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative flex flex-col rounded-lg border-2 p-4 text-left transition-all',
        riskColors[instrument.riskLevel],
        isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{instrument.name}</h3>
          <p className="text-xs text-muted-foreground">{instrument.description}</p>
        </div>
        <div
          className={cn(
            'flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium',
            instrument.riskLevel === 'low' && 'bg-success/20 text-success',
            instrument.riskLevel === 'medium' && 'bg-warning/20 text-warning',
            instrument.riskLevel === 'high' && 'bg-danger/20 text-danger',
            instrument.riskLevel === 'extreme' && 'bg-danger/30 text-danger'
          )}
        >
          <RiskIcon className="h-3 w-3" />
          {riskLabels[instrument.riskLevel]}
        </div>
      </div>

      {/* Probability Distribution */}
      <div className="mb-3 space-y-1">
        <div className="text-xs font-medium text-muted-foreground">Outcomes:</div>
        <div className="flex h-2 overflow-hidden rounded-full bg-muted">
          {instrument.outcomes.map((outcome, idx) => (
            <motion.div
              key={outcome.label}
              initial={{ width: 0 }}
              animate={{ width: `${outcome.probability * 100}%` }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                'h-full',
                outcome.multiplier > 0.3 && 'bg-success',
                outcome.multiplier > 0 && outcome.multiplier <= 0.3 && 'bg-success/60',
                outcome.multiplier === 0 && 'bg-muted-foreground',
                outcome.multiplier < 0 && outcome.multiplier > -0.5 && 'bg-warning',
                outcome.multiplier <= -0.5 && 'bg-danger'
              )}
              title={`${outcome.label}: ${(outcome.probability * 100).toFixed(0)}%`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {instrument.outcomes.map((outcome) => (
            <span
              key={outcome.label}
              className={cn(
                'rounded px-1.5 py-0.5 text-[10px]',
                outcome.multiplier > 0 ? 'bg-success/20 text-success' : outcome.multiplier < 0 ? 'bg-danger/20 text-danger' : 'bg-muted text-muted-foreground'
              )}
            >
              {outcome.label}: {(outcome.probability * 100).toFixed(0)}%
            </span>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded bg-card/50 p-2">
          <div className="text-muted-foreground">Expected Value</div>
          <div className={cn('font-mono font-bold', ev >= 0 ? 'text-success' : 'text-danger')}>
            {ev >= 0 ? '+' : ''}
            {(ev * 100).toFixed(1)}%
          </div>
        </div>
        <div className="rounded bg-card/50 p-2">
          <div className="text-muted-foreground">Volatility</div>
          <div className={cn('font-mono font-bold', volatility > 0.5 ? 'text-warning' : 'text-foreground')}>{(volatility * 100).toFixed(1)}%</div>
        </div>
        <div className="rounded bg-card/50 p-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-success" />
            Best Case
          </div>
          <div className="font-mono font-bold text-success">
            +{(bestCase.multiplier * 100).toFixed(0)}%
          </div>
        </div>
        <div className="rounded bg-card/50 p-2">
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendingDown className="h-3 w-3 text-danger" />
            Worst Case
          </div>
          <div className="font-mono font-bold text-danger">{(worstCase.multiplier * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Min/Max Stakes */}
      <div className="mt-3 flex justify-between text-xs text-muted-foreground">
        <span>Min: {formatTimeString(instrument.minStake)}</span>
        <span>Max: {(instrument.maxStakePercent * 100).toFixed(0)}% of life</span>
      </div>
    </motion.button>
  );
}
