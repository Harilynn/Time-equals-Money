'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame, MARKET_INSTRUMENTS } from '@/lib/game-context';
import { MarketInstrument, Decision, getAvailableInstruments } from '@/lib/game-engine';
import { TimeDisplay } from './time-display';
import { MarketStatus } from './market-status';
import { InstrumentCard } from './instrument-card';
import { StakeSelector } from './stake-selector';
import { OutcomeDisplay } from './outcome-display';
import { MarginPanel } from './margin-panel';
import { LessonPanel } from './lesson-panel';
import { IdleHint } from './idle-hint';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { soundManager } from '@/lib/sound-manager';
import { DollarSign, ArrowRight, CreditCard, GraduationCap, FlaskConical, Skull, Heart, AlertTriangle } from 'lucide-react';

type GamePhase = 'decide' | 'commit' | 'resolution' | 'feedback' | 'earn';

export function GameBoard() {
  const { state, makeDecision, nextRound, playerTitle, startSimulation, endSimulation } = useGame();
  const [phase, setPhase] = useState<GamePhase>('decide'); // Start directly on decide phase, not earn
  const [selectedInstrument, setSelectedInstrument] = useState<MarketInstrument | null>(null);
  const [lastDecision, setLastDecision] = useState<Decision | null>(null);
  const [showMarginPanel, setShowMarginPanel] = useState(false);
  const [showLessonPanel, setShowLessonPanel] = useState(false);

  const availableInstruments = getAvailableInstruments(state.playerLevel);

  const handleSelectInstrument = useCallback((instrument: MarketInstrument) => {
    soundManager.playClick();
    setSelectedInstrument(instrument);
    setPhase('commit');
  }, []);

  const handleConfirmTrade = useCallback(
    (stake: number) => {
      if (!selectedInstrument) return;

      const decision = makeDecision(selectedInstrument, stake);
      if (decision) {
        setLastDecision(decision);
        setPhase('resolution');

        setTimeout(() => {
          if (decision.netChange > 0) {
            soundManager.playWin();
          } else if (decision.netChange < 0) {
            soundManager.playLoss();
          }
          setPhase('feedback');
        }, 1500);
      }
    },
    [selectedInstrument, makeDecision]
  );

  const handleCancelTrade = useCallback(() => {
    setSelectedInstrument(null);
    setPhase('decide');
  }, []);

  const handleContinue = useCallback(() => {
    nextRound();
    setSelectedInstrument(null);
    setLastDecision(null);
    // Always go to decide phase, never earn phase
    setPhase('decide');
  }, [nextRound]);

  const handleSimulationToggle = useCallback(() => {
    if (state.isSimulationMode) {
      endSimulation();
    } else {
      startSimulation();
    }
  }, [state.isSimulationMode, startSimulation, endSimulation]);

  return (
    <div className="min-h-screen bg-background">
      {/* Idle Hint Popup */}
      <IdleHint />

      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-foreground">TIME IS THE MARKET</h1>
            <span className="rounded bg-danger/10 px-2 py-0.5 text-xs font-bold text-danger">HIGH STAKES</span>
            {state.isSimulationMode && (
              <span className="rounded bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                SIMULATION
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulationToggle}
              className={cn(
                'gap-2 bg-transparent',
                state.isSimulationMode && 'border-primary text-primary'
              )}
            >
              <FlaskConical className="h-4 w-4" />
              {state.isSimulationMode ? 'Exit Simulation' : 'Practice Mode'}
            </Button>
            <TimeDisplay />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="space-y-6">
          {/* Phase Indicator & Round Info */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                Round <span className="font-bold text-foreground">{state.currentRound}</span> of {state.maxRounds}
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                {(['earn', 'decide', 'commit', 'resolution', 'feedback'] as GamePhase[]).map((p, idx) => (
                  <div key={p} className="flex items-center gap-2">
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                        phase === p ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {idx + 1}
                    </div>
                    {idx < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">{playerTitle}</span>
            </div>
          </div>

          {/* Simulation Mode Warning */}
          {state.isSimulationMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-lg border-2 border-primary bg-primary/10 px-4 py-3"
            >
              <FlaskConical className="h-5 w-5 text-primary" />
              <div>
                <p className="font-bold text-primary">Simulation Mode Active</p>
                <p className="text-sm text-muted-foreground">
                  Practice without risking your real lifetime. Exit simulation to return to your saved state.
                </p>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* PHASE 1: DECIDE - Players always earn money when they win. No initial income phase. */}
            {phase === 'decide' && (
              <motion.div 
                key="decide" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Action Bar */}
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Choose Your Trade</h2>
                    <p className="text-sm text-muted-foreground">
                      Risk your remaining lifetime for potential gains
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowLessonPanel(true)} 
                      className="gap-2 bg-transparent"
                    >
                      <GraduationCap className="h-4 w-4" />
                      Learn ({state.unlockedLessons.length}/5)
                    </Button>
                    {state.playerLevel >= 3 && (
                      <Button 
                        variant="outline" 
                        onClick={() => setShowMarginPanel(true)} 
                        className="gap-2 bg-transparent"
                      >
                        <CreditCard className="h-4 w-4" />
                        Borrow Time
                      </Button>
                    )}
                  </div>
                </div>

                {/* Warning Banner */}
                <div className="mb-4 flex items-center gap-3 rounded-lg border border-danger/50 bg-danger/10 px-4 py-3">
                  <Skull className="h-5 w-5 text-danger" />
                  <p className="text-sm text-danger">
                    <span className="font-bold">Warning:</span> Any time you invest can be lost. 
                    If your remaining lifetime reaches zero, you die.
                  </p>
                </div>

                {/* Market Status */}
                <div className="mb-4">
                  <MarketStatus />
                </div>

                {/* Instruments Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {MARKET_INSTRUMENTS.map((instrument) => (
                    <InstrumentCard
                      key={instrument.id}
                      instrument={instrument}
                      isLocked={instrument.unlockLevel > state.playerLevel}
                      isSelected={selectedInstrument?.id === instrument.id}
                      onClick={() => handleSelectInstrument(instrument)}
                    />
                  ))}
                </div>

                {/* Panels */}
                <AnimatePresence>
                  {showMarginPanel && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
                      onClick={() => setShowMarginPanel(false)}
                    >
                      <div onClick={(e) => e.stopPropagation()}>
                        <MarginPanel onClose={() => setShowMarginPanel(false)} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showLessonPanel && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
                      onClick={() => setShowLessonPanel(false)}
                    >
                      <div onClick={(e) => e.stopPropagation()}>
                        <LessonPanel onClose={() => setShowLessonPanel(false)} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* PHASE 2: COMMIT */}
            {phase === 'commit' && selectedInstrument && (
              <motion.div 
                key="commit" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
              >
                <StakeSelector 
                  instrument={selectedInstrument} 
                  onConfirm={handleConfirmTrade} 
                  onCancel={handleCancelTrade} 
                />
              </motion.div>
            )}

            {/* PHASE 3: RESOLUTION */}
            {phase === 'resolution' && lastDecision && (
              <motion.div
                key="resolution"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col items-center justify-center py-16"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, ease: 'linear', repeat: Infinity }}
                  className="mb-6 h-20 w-20 rounded-full border-4 border-primary border-t-transparent"
                />
                <p className="text-xl text-muted-foreground">Resolving trade...</p>
                <p className="mt-2 text-sm text-muted-foreground">Your fate is being decided</p>
              </motion.div>
            )}

            {/* PHASE 4: FEEDBACK */}
            {phase === 'feedback' && lastDecision && (
              <motion.div 
                key="feedback" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
              >
                <div className="w-full max-w-3xl">
                  <OutcomeDisplay decision={lastDecision} onContinue={handleContinue} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
