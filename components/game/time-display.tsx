'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/lib/game-context';
import { formatTimeUnits, STARTING_TIME } from '@/lib/game-engine';
import { cn } from '@/lib/utils';
import { Skull, AlertTriangle, Clock, Heart } from 'lucide-react';

export function TimeDisplay() {
  const { state } = useGame();
  const { timeRemaining, marginDebt, bonusTime, isSimulationMode } = state;

  const time = formatTimeUnits(timeRemaining);
  const percentRemaining = (timeRemaining / STARTING_TIME) * 100;
  
  // Death is near thresholds
  const urgencyLevel = 
    timeRemaining <= 365 ? 'critical' : // Less than 1 year
    timeRemaining <= 1825 ? 'danger' :  // Less than 5 years
    timeRemaining <= 3650 ? 'warning' : // Less than 10 years
    'normal';

  const getUrgencyMessage = () => {
    if (timeRemaining <= 30) return "DEATH IMMINENT";
    if (timeRemaining <= 90) return "MONTHS TO LIVE";
    if (timeRemaining <= 365) return "LESS THAN A YEAR";
    if (timeRemaining <= 1825) return "TIME RUNNING OUT";
    if (timeRemaining <= 3650) return "BE CAREFUL";
    return "REMAINING LIFETIME";
  };

  return (
    <div className="relative">
      {/* Simulation Mode Badge */}
      {isSimulationMode && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground"
        >
          SIMULATION MODE - NO REAL RISK
        </motion.div>
      )}

      <motion.div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 p-4 backdrop-blur-sm',
          urgencyLevel === 'critical' && 'animate-pulse border-danger bg-danger/20',
          urgencyLevel === 'danger' && 'border-danger bg-danger/10',
          urgencyLevel === 'warning' && 'border-warning bg-warning/10',
          urgencyLevel === 'normal' && 'border-primary bg-primary/5',
          isSimulationMode && 'border-primary/50 bg-primary/10'
        )}
        animate={{
          scale: urgencyLevel === 'critical' ? [1, 1.02, 1] : 1,
        }}
        transition={{
          duration: 0.5,
          repeat: urgencyLevel === 'critical' ? Infinity : 0,
        }}
      >
        {/* Death Icon for Critical */}
        {urgencyLevel === 'critical' && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -top-3 -right-3"
          >
            <Skull className="h-6 w-6 text-danger" />
          </motion.div>
        )}

        {/* Header */}
        <div className="flex items-center gap-2">
          {urgencyLevel === 'critical' ? (
            <Skull className="h-4 w-4 text-danger" />
          ) : urgencyLevel === 'danger' ? (
            <AlertTriangle className="h-4 w-4 text-danger" />
          ) : (
            <Heart className="h-4 w-4 text-primary" />
          )}
          <span className={cn(
            'text-xs uppercase tracking-wider font-bold',
            urgencyLevel === 'critical' && 'text-danger',
            urgencyLevel === 'danger' && 'text-danger',
            urgencyLevel === 'warning' && 'text-warning',
            urgencyLevel === 'normal' && 'text-muted-foreground'
          )}>
            {getUrgencyMessage()}
          </span>
        </div>

        {/* Main Time Display */}
        <div className="mt-2 flex items-baseline gap-1">
          {time.years > 0 && (
            <motion.div key={`years-${time.years}`} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="flex items-baseline">
              <span className={cn(
                'font-mono text-4xl font-bold tabular-nums',
                urgencyLevel === 'critical' && 'text-danger',
                urgencyLevel === 'danger' && 'text-danger',
                urgencyLevel === 'warning' && 'text-warning',
                urgencyLevel === 'normal' && 'text-primary'
              )}>
                {time.years}
              </span>
              <span className="text-sm text-muted-foreground ml-0.5">y</span>
            </motion.div>
          )}
          {(time.months > 0 || time.years > 0) && (
            <motion.div key={`months-${time.months}`} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="flex items-baseline">
              <span className={cn(
                'font-mono text-3xl font-bold tabular-nums',
                urgencyLevel === 'critical' && 'text-danger',
                urgencyLevel === 'danger' && 'text-danger',
                urgencyLevel === 'warning' && 'text-warning',
                urgencyLevel === 'normal' && 'text-primary'
              )}>
                {time.months}
              </span>
              <span className="text-sm text-muted-foreground ml-0.5">m</span>
            </motion.div>
          )}
          <motion.div key={`days-${time.days}`} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className="flex items-baseline">
            <span className={cn(
              'font-mono text-2xl font-bold tabular-nums',
              urgencyLevel === 'critical' && 'text-danger',
              urgencyLevel === 'danger' && 'text-danger',
              urgencyLevel === 'warning' && 'text-warning',
              urgencyLevel === 'normal' && 'text-primary'
            )}>
              {time.days}
            </span>
            <span className="text-sm text-muted-foreground ml-0.5">d</span>
          </motion.div>
        </div>

        {/* Total Days */}
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{timeRemaining.toLocaleString()} days total</span>
        </div>

        {/* Life Bar */}
        <div className="mt-3 w-full">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${percentRemaining}%` }}
              className={cn(
                'h-full transition-colors duration-500',
                urgencyLevel === 'critical' && 'bg-danger',
                urgencyLevel === 'danger' && 'bg-danger',
                urgencyLevel === 'warning' && 'bg-warning',
                urgencyLevel === 'normal' && 'bg-primary'
              )}
            />
          </div>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>Death</span>
            <span>{percentRemaining.toFixed(1)}% of life remaining</span>
          </div>
        </div>

        {/* Bonus Time Popup */}
        <AnimatePresence>
          {bonusTime > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              className="absolute -top-3 right-2 rounded bg-success px-2 py-0.5 text-xs font-bold text-background"
            >
              +{formatTimeUnits(bonusTime).months > 0 ? `${formatTimeUnits(bonusTime).months}m ` : ''}{formatTimeUnits(bonusTime).days}d
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Margin Debt Warning */}
      {marginDebt > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-2 rounded border border-danger/50 bg-danger/10 px-3 py-2 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="h-4 w-4 text-danger" />
            <span className="text-sm font-bold text-danger">BORROWED TIME</span>
          </div>
          <div className="text-xs text-danger">
            {formatTimeUnits(marginDebt).years > 0 && `${formatTimeUnits(marginDebt).years}y `}
            {formatTimeUnits(marginDebt).months > 0 && `${formatTimeUnits(marginDebt).months}m `}
            {formatTimeUnits(marginDebt).days}d in debt
          </div>
          <div className="text-xs text-muted-foreground">(15% interest per round)</div>
        </motion.div>
      )}
    </div>
  );
}
