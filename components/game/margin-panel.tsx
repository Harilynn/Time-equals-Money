'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '@/lib/game-context';
import { formatTimeString } from '@/lib/game-engine';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { AlertTriangle, ArrowUp, ArrowDown, Percent } from 'lucide-react';

interface MarginPanelProps {
  onClose: () => void;
}

export function MarginPanel({ onClose }: MarginPanelProps) {
  const { state, borrowMargin, repayMargin } = useGame();
  const [borrowAmount, setBorrowAmount] = useState(20);
  const [repayAmount, setRepayAmount] = useState(Math.min(20, state.marginDebt));
  const [mode, setMode] = useState<'borrow' | 'repay'>('borrow');

  const maxBorrow = Math.floor(state.timeRemaining * 0.5); // Max 50% of current time
  const interestRate = 15; // 15% per round

  const handleBorrow = () => {
    borrowMargin(borrowAmount);
    onClose();
  };

  const handleRepay = () => {
    repayMargin(repayAmount);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-lg border-2 border-warning bg-card p-6"
    >
      <div className="mb-6 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-warning" />
        <h3 className="text-lg font-bold text-foreground">Margin Trading</h3>
      </div>

      {/* Warning Banner */}
      <div className="mb-6 rounded border border-danger/50 bg-danger/10 p-3 text-sm text-danger">
        <strong>WARNING:</strong> Borrowing time creates debt with {interestRate}% interest per round.
        Failure to repay will accelerate your demise!
      </div>

      {/* Mode Tabs */}
      <div className="mb-6 flex rounded-lg bg-muted p-1">
        <button
          onClick={() => setMode('borrow')}
          className={cn(
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            mode === 'borrow' ? 'bg-warning text-background' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <ArrowUp className="mr-1 inline h-4 w-4" />
          Borrow
        </button>
        <button
          onClick={() => setMode('repay')}
          disabled={state.marginDebt === 0}
          className={cn(
            'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
            mode === 'repay' ? 'bg-success text-background' : 'text-muted-foreground hover:text-foreground',
            state.marginDebt === 0 && 'cursor-not-allowed opacity-50'
          )}
        >
          <ArrowDown className="mr-1 inline h-4 w-4" />
          Repay
        </button>
      </div>

      {/* Current Debt Display */}
      <div className="mb-6 rounded bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Current Margin Debt</span>
          <span className={cn('font-mono text-xl font-bold', state.marginDebt > 0 ? 'text-danger' : 'text-success')}>
            {formatTimeString(state.marginDebt)}
          </span>
        </div>
        {state.marginDebt > 0 && (
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Percent className="h-3 w-3" />
              Interest next round:
            </span>
            <span className="font-mono text-danger">-{Math.round(state.marginDebt * 0.15)} units</span>
          </div>
        )}
      </div>

      {mode === 'borrow' ? (
        <>
          {/* Borrow Slider */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Borrow Amount</span>
              <span className="font-mono text-xl font-bold text-warning">{borrowAmount} units</span>
            </div>

            <Slider value={[borrowAmount]} onValueChange={(v) => setBorrowAmount(v[0])} min={10} max={maxBorrow} step={5} />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: 10</span>
              <span>Max: {maxBorrow} (50% of time)</span>
            </div>
          </div>

          {/* Projection */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded bg-success/10 p-3 text-center">
              <div className="text-xs text-muted-foreground">Time After Borrow</div>
              <div className="font-mono text-lg font-bold text-success">{state.timeRemaining + borrowAmount}</div>
            </div>
            <div className="rounded bg-danger/10 p-3 text-center">
              <div className="text-xs text-muted-foreground">New Total Debt</div>
              <div className="font-mono text-lg font-bold text-danger">{state.marginDebt + borrowAmount}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleBorrow} className="flex-1 bg-warning text-background hover:bg-warning/90">
              Borrow {borrowAmount} Units
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Repay Slider */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Repay Amount</span>
              <span className="font-mono text-xl font-bold text-success">{repayAmount} units</span>
            </div>

            <Slider
              value={[repayAmount]}
              onValueChange={(v) => setRepayAmount(v[0])}
              min={5}
              max={Math.min(state.marginDebt, state.timeRemaining - 10)}
              step={5}
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Min: 5</span>
              <span>Max: {Math.min(state.marginDebt, state.timeRemaining - 10)}</span>
            </div>
          </div>

          {/* Projection */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded bg-warning/10 p-3 text-center">
              <div className="text-xs text-muted-foreground">Time After Repay</div>
              <div className="font-mono text-lg font-bold text-warning">{state.timeRemaining - repayAmount}</div>
            </div>
            <div className="rounded bg-success/10 p-3 text-center">
              <div className="text-xs text-muted-foreground">Remaining Debt</div>
              <div className="font-mono text-lg font-bold text-success">{state.marginDebt - repayAmount}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleRepay} className="flex-1 bg-success hover:bg-success/90 text-background">
              Repay {repayAmount} Units
            </Button>
          </div>
        </>
      )}
    </motion.div>
  );
}
