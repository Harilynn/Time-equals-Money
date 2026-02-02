'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MarketInstrument, calculateEV, formatTimeString, formatTimeUnits } from '@/lib/game-engine';
import { useGame } from '@/lib/game-context';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ProbabilityChart } from './probability-chart';
import { soundManager } from '@/lib/sound-manager';
import { AlertTriangle, Zap, Skull, Clock, ArrowRight, ArrowDown } from 'lucide-react';

interface StakeSelectorProps {
  instrument: MarketInstrument;
  onConfirm: (stake: number) => void;
  onCancel: () => void;
}

export function StakeSelector({ instrument, onConfirm, onCancel }: StakeSelectorProps) {
  const { state } = useGame();
  const [stake, setStake] = useState(instrument.minStake);
  const [countdown, setCountdown] = useState(15);
  const [isCommitted, setIsCommitted] = useState(false);

  const maxStake = Math.floor(state.timeRemaining * instrument.maxStakePercent);
  const ev = calculateEV(instrument.outcomes);
  
  // Calculate actual outcomes in time
  const expectedChange = Math.round(stake * ev);
  const worstCase = Math.round(stake * Math.min(...instrument.outcomes.map((o) => o.multiplier)));
  const bestCase = Math.round(stake * Math.max(...instrument.outcomes.map((o) => o.multiplier)));
  
  // Time after trade scenarios
  const timeAfterExpected = state.timeRemaining + expectedChange;
  const timeAfterWorst = state.timeRemaining + worstCase;
  const timeAfterBest = state.timeRemaining + bestCase;

  // Risk assessment
  const riskPercent = (stake / state.timeRemaining) * 100;
  const isHighRisk = riskPercent > 30;
  const isAllIn = riskPercent > 80;
  const couldDie = timeAfterWorst <= 0;

  // Countdown timer
  useEffect(() => {
    if (isCommitted) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          soundManager.playWarning();
          return 0;
        }
        if (prev <= 4) {
          soundManager.playWarning();
        } else {
          soundManager.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCommitted]);

  const handleCommit = () => {
    setIsCommitted(true);
    soundManager.playCommit();
    setTimeout(() => {
      onConfirm(stake);
    }, 500);
  };

  const stakeTime = formatTimeUnits(stake);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-lg border-2 border-primary bg-card p-6"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">{instrument.name}</h3>
          <p className="text-sm text-muted-foreground">{instrument.description}</p>
        </div>
        <motion.div
          animate={{
            scale: countdown <= 3 ? [1, 1.1, 1] : 1,
            color: countdown <= 3 ? '#ef4444' : undefined,
          }}
          transition={{ duration: 0.5, repeat: countdown <= 3 ? Infinity : 0 }}
          className={cn(
            'font-mono text-3xl font-bold',
            countdown <= 3 ? 'text-danger' : countdown <= 5 ? 'text-warning' : 'text-muted-foreground'
          )}
        >
          {countdown}s
        </motion.div>
      </div>

      {/* Death Warning */}
      {couldDie && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-3 rounded-lg border-2 border-danger bg-danger/20 px-4 py-3"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Skull className="h-8 w-8 text-danger" />
          </motion.div>
          <div>
            <p className="font-bold text-danger">THIS TRADE COULD KILL YOU</p>
            <p className="text-sm text-danger/80">
              Worst case: You will have {timeAfterWorst <= 0 ? 'NO TIME LEFT' : formatTimeString(timeAfterWorst)} remaining
            </p>
          </div>
        </motion.div>
      )}

      {/* Stake Selection */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Time to Risk</span>
          </div>
          <motion.div
            key={stake}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={cn(
              'text-right',
              isAllIn ? 'text-danger' : isHighRisk ? 'text-warning' : 'text-primary'
            )}
          >
            <div className="font-mono text-2xl font-bold">
              {stakeTime.years > 0 && `${stakeTime.years}y `}
              {stakeTime.months > 0 && `${stakeTime.months}m `}
              {stakeTime.days > 0 && `${stakeTime.days}d`}
            </div>
            <div className="text-xs text-muted-foreground">
              {stake.toLocaleString()} days
            </div>
          </motion.div>
        </div>

        <Slider
          value={[stake]}
          onValueChange={(value) => setStake(value[0])}
          min={instrument.minStake}
          max={maxStake}
          step={15} // Half month steps
          disabled={isCommitted}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Min: {formatTimeString(instrument.minStake)}</span>
          <span>Max: {formatTimeString(maxStake)}</span>
        </div>

        {/* Risk Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Risk Level</span>
            <span className={cn(
              'font-bold',
              isAllIn ? 'text-danger' : isHighRisk ? 'text-warning' : 'text-success'
            )}>
              {riskPercent.toFixed(1)}% of remaining life
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, riskPercent)}%` }}
              className={cn(
                'h-full transition-colors',
                isAllIn ? 'bg-danger' : isHighRisk ? 'bg-warning' : 'bg-success'
              )}
            />
          </div>
        </div>
      </div>

      {/* Probability Chart */}
      <div className="mb-6">
        <ProbabilityChart instrument={instrument} stake={stake} />
      </div>

      {/* Outcome Scenarios */}
      <div className="mb-6 space-y-3">
        <h4 className="text-sm font-bold text-foreground">If you risk {formatTimeString(stake)}:</h4>
        
        {/* Scenario Cards */}
        <div className="grid gap-3 md:grid-cols-3">
          {/* Best Case */}
          <div className="rounded-lg border border-success/50 bg-success/10 p-3">
            <div className="mb-1 text-xs font-medium text-success">Best Case</div>
            <div className="flex items-center gap-1">
              <ArrowRight className="h-4 w-4 text-success" />
              <span className="font-mono text-lg font-bold text-success">
                +{formatTimeString(bestCase)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              You'll have: {formatTimeString(timeAfterBest)}
            </div>
          </div>

          {/* Expected */}
          <div className={cn(
            'rounded-lg border p-3',
            ev >= 0 ? 'border-primary/50 bg-primary/10' : 'border-warning/50 bg-warning/10'
          )}>
            <div className={cn('mb-1 text-xs font-medium', ev >= 0 ? 'text-primary' : 'text-warning')}>
              Expected (Avg)
            </div>
            <div className="flex items-center gap-1">
              {expectedChange >= 0 ? (
                <ArrowRight className={cn('h-4 w-4', ev >= 0 ? 'text-primary' : 'text-warning')} />
              ) : (
                <ArrowDown className="h-4 w-4 text-warning" />
              )}
              <span className={cn('font-mono text-lg font-bold', ev >= 0 ? 'text-primary' : 'text-warning')}>
                {expectedChange >= 0 ? '+' : ''}{formatTimeString(Math.abs(expectedChange))}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              You'll have: {formatTimeString(timeAfterExpected)}
            </div>
          </div>

          {/* Worst Case */}
          <div className={cn(
            'rounded-lg border p-3',
            couldDie ? 'border-danger bg-danger/20' : 'border-danger/50 bg-danger/10'
          )}>
            <div className="mb-1 flex items-center gap-1 text-xs font-medium text-danger">
              {couldDie && <Skull className="h-3 w-3" />}
              Worst Case
            </div>
            <div className="flex items-center gap-1">
              <ArrowDown className="h-4 w-4 text-danger" />
              <span className="font-mono text-lg font-bold text-danger">
                {formatTimeString(Math.abs(worstCase))}
              </span>
            </div>
            <div className={cn('text-xs', couldDie ? 'font-bold text-danger' : 'text-muted-foreground')}>
              {couldDie ? 'YOU DIE' : `You'll have: ${formatTimeString(timeAfterWorst)}`}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Warnings */}
      {isAllIn && !couldDie && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 rounded border border-danger bg-danger/10 px-4 py-2 text-danger"
        >
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm font-medium">ALL-IN: Risking most of your remaining lifetime!</span>
        </motion.div>
      )}

      {isHighRisk && !isAllIn && !couldDie && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 rounded border border-warning bg-warning/10 px-4 py-2 text-warning"
        >
          <Zap className="h-5 w-5" />
          <span className="text-sm font-medium">High risk: Consider the Kelly Criterion for position sizing</span>
        </motion.div>
      )}

      {ev < 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-center gap-2 rounded border border-warning bg-warning/10 px-4 py-2 text-warning"
        >
          <AlertTriangle className="h-5 w-5" />
          <span className="text-sm font-medium">
            Negative EV ({(ev * 100).toFixed(1)}%): You are statistically expected to lose time
          </span>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onCancel} 
          disabled={isCommitted} 
          className="flex-1 bg-transparent"
        >
          Cancel
        </Button>
        <motion.div 
          className="flex-1" 
          whileHover={{ scale: isCommitted ? 1 : 1.02 }} 
          whileTap={{ scale: isCommitted ? 1 : 0.98 }}
        >
          <Button
            onClick={handleCommit}
            disabled={isCommitted || countdown === 0}
            className={cn(
              'w-full font-bold',
              couldDie 
                ? 'bg-danger hover:bg-danger/90' 
                : isAllIn 
                  ? 'bg-danger hover:bg-danger/90' 
                  : isHighRisk 
                    ? 'bg-warning hover:bg-warning/90 text-background' 
                    : 'bg-primary hover:bg-primary/90'
            )}
          >
            {isCommitted ? 'Executing...' : couldDie ? 'RISK MY LIFE' : isAllIn ? 'GO ALL-IN' : 'COMMIT TRADE'}
          </Button>
        </motion.div>
      </div>

      {countdown === 0 && !isCommitted && (
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="mt-4 text-center text-sm text-danger"
        >
          Time expired! Click Cancel to go back.
        </motion.p>
      )}
    </motion.div>
  );
}
