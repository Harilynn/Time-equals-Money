'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HISTORICAL_SCENARIOS,
  ABSTRACTED_SCENARIOS,
  SimulationScenario,
  SimulationState,
  EventType,
  SimulationDecision,
  SimulationDecisionOption,
  formatSimulationResults,
  createSimulationState,
  simulateDay,
} from '@/lib/simulation-engine';
import { soundManager } from '@/lib/sound-manager';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BookOpen,
  FlaskConical,
  Gauge,
  Play,
  RotateCcw,
  Scale,
  Skull,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SimulationModeProps {
  onBack: () => void;
}

export function SimulationMode({ onBack }: SimulationModeProps) {
  const [stage, setStage] = useState<'select' | 'configure' | 'running' | 'results'>('select');
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario | null>(null);
  const [enabledEvents, setEnabledEvents] = useState<Partial<Record<EventType, boolean>>>({
    boom: true,
    crash: true,
    panic: true,
    regulation: true,
  });
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [interactiveMode, setInteractiveMode] = useState(true);
  const [pendingDecision, setPendingDecision] = useState<SimulationDecision | null>(null);
  const [decisionIndex, setDecisionIndex] = useState(0);
  const [focusedOption, setFocusedOption] = useState<SimulationDecisionOption | null>(null);
  const [lossAlert, setLossAlert] = useState<{ title: string; detail: string } | null>(null);
  const [lastAlertDay, setLastAlertDay] = useState<number | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stateRef = useRef<SimulationState | null>(null);
  const scenarioRef = useRef<SimulationScenario | null>(null);

  const eventIcons = {
    boom: TrendingUp,
    crash: TrendingDown,
    panic: AlertTriangle,
    regulation: Scale,
  };

  const eventNames = {
    boom: 'Market Boom',
    crash: 'Market Crash',
    panic: 'Panic Selling',
    regulation: 'Regulation Impact',
  };

  const eventDescriptions = {
    boom: 'Sudden bullish moves, euphoria, FOMO buying',
    crash: 'Violent price collapse, margin calls, forced selling',
    panic: 'Fear-driven selling, circuit breakers, liquidity dries up',
    regulation: 'Policy changes, new rules, compliance costs',
  };

  const clearSimulationInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const applyDecisionOption = (
    state: SimulationState,
    scenario: SimulationScenario,
    option: SimulationDecisionOption
  ): SimulationState => {
    const newPrice = Math.max(state.currentPrice * (1 + option.effects.priceShock), state.currentPrice * 0.01);
    const newSentiment = Math.max(-100, Math.min(100, state.sentiment + option.effects.sentiment));
    const newVolatility = Math.max(scenario.volatilityBase * 0.5, Math.min(0.3, state.volatility * (1 + option.effects.volatility)));

    return {
      ...state,
      currentPrice: newPrice,
      sentiment: newSentiment,
      volatility: newVolatility,
      priceHistory: [...state.priceHistory, newPrice],
      snapshots: [
        ...state.snapshots,
        {
          timestamp: state.currentDay,
          price: newPrice,
          volatility: newVolatility,
          volume: state.volume,
          sentiment: newSentiment,
          activeEvents: state.activeEvents,
        },
      ],
      score: state.score + option.effects.score,
      profitLoss: newPrice - scenario.basePrice,
    };
  };

  const startSimulationInterval = (scenario: SimulationScenario) => {
    clearSimulationInterval();

    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (!stateRef.current) return p;

        if (p >= scenario.durationDays) {
          clearSimulationInterval();
          setIsRunning(false);
          setStage('results');
          return scenario.durationDays;
        }

        const currentDay = Math.floor(p);
        if (interactiveMode && pendingDecision === null && scenario.decisions?.length) {
          const nextDecision = scenario.decisions[decisionIndex];
          if (nextDecision && currentDay >= nextDecision.day) {
            clearSimulationInterval();
            setIsRunning(false);
            setPendingDecision(nextDecision);
            soundManager.playWarning();
            return p;
          }
        }

        const nextState = simulateDay(stateRef.current, scenario, currentDay);
        stateRef.current = nextState;
        setSimulationState({ ...nextState });
        return Math.min(p + 1, scenario.durationDays);
      });
    }, 100 / speed);
  };

  // Run simulation
  const runSimulation = (scenario: SimulationScenario) => {
    setSelectedScenario(scenario);
    setIsRunning(true);
    setProgress(0);
    setStage('running');
    setLossAlert(null);
    setLastAlertDay(null);
    setPendingDecision(null);
    setDecisionIndex(0);

    let state = createSimulationState(scenario);
    stateRef.current = state;
    setSimulationState(state);

    const modifiedScenario: SimulationScenario = {
      ...scenario,
      events: {
        ...scenario.events,
        boom: scenario.events.boom ? { ...scenario.events.boom, enabled: enabledEvents.boom ?? true } : undefined,
        crash: scenario.events.crash ? { ...scenario.events.crash, enabled: enabledEvents.crash ?? true } : undefined,
        panic: scenario.events.panic ? { ...scenario.events.panic, enabled: enabledEvents.panic ?? true } : undefined,
        regulation: scenario.events.regulation ? { ...scenario.events.regulation, enabled: enabledEvents.regulation ?? true } : undefined,
      },
    };

    scenarioRef.current = modifiedScenario;
    startSimulationInterval(modifiedScenario);
  };

  const handleDecisionSelect = (option: SimulationDecisionOption) => {
    if (!stateRef.current || !scenarioRef.current) return;

    const updatedState = applyDecisionOption(stateRef.current, scenarioRef.current, option);
    stateRef.current = updatedState;
    setSimulationState({ ...updatedState });
    setPendingDecision(null);
    setFocusedOption(null);
    setDecisionIndex((idx) => idx + 1);
    setIsRunning(true);
    soundManager.playClick();
    startSimulationInterval(scenarioRef.current);
  };

  const toggleEvent = (eventType: EventType) => {
    setEnabledEvents((prev) => ({
      ...prev,
      [eventType]: !prev[eventType],
    }));
  };

  useEffect(() => {
    if (stage !== 'running') {
      setLossAlert(null);
      setLastAlertDay(null);
      return;
    }

    if (!simulationState || simulationState.priceHistory.length < 2) return;

    const currentDay = simulationState.priceHistory.length - 1;
    if (lastAlertDay === currentDay) return;

    const prevPrice = simulationState.priceHistory[currentDay - 1];
    const currentPrice = simulationState.priceHistory[currentDay];
    if (!prevPrice) return;

    const dailyChange = (currentPrice - prevPrice) / prevPrice;
    const hasCrash = simulationState.activeEvents.includes('crash');
    const hasPanic = simulationState.activeEvents.includes('panic');

    if (dailyChange <= -0.06 || hasCrash || hasPanic) {
      const title = hasCrash ? 'Market Crash' : hasPanic ? 'Panic Wave' : 'Blood Red Session';
      const detail = hasCrash
        ? 'Liquidity vanished. Risk spikes, exits vanish.'
        : hasPanic
          ? 'Fear spreads fast. Order books thin out.'
          : 'Momentum snapped. Buyers stepped back.';

      setLossAlert({ title, detail });
      setLastAlertDay(currentDay);
      soundManager.playLoss();

      const timeout = setTimeout(() => setLossAlert(null), 2600);
      return () => clearTimeout(timeout);
    }
  }, [stage, simulationState, lastAlertDay]);

  useEffect(() => {
    return () => {
      clearSimulationInterval();
    };
  }, []);

  // STAGE 1: Scenario Selection
  if (stage === 'select') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-background p-8 overflow-y-auto"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-12">
            <div className="flex items-center gap-3">
              <FlaskConical className="h-8 w-8 text-warning" />
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-danger via-warning to-danger">
                MARKET SIMULATION
              </h1>
            </div>
            <p className="text-lg text-muted-foreground mt-2">Experience real and abstracted market scenarios without risking your life</p>
            <p className="text-sm text-muted-foreground mt-2">
              Learn market dynamics, test strategies, and prepare for the Live Market challenge
            </p>
          </motion.div>

          {/* Historical Scenarios */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mb-12">
            <h2 className="text-2xl font-bold text-warning mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Historical Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {HISTORICAL_SCENARIOS.map((scenario, idx) => (
                <motion.button
                  key={scenario.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedScenario(scenario);
                    setStage('configure');
                  }}
                  className="p-6 bg-card/60 border-2 border-warning/40 rounded-xl hover:border-warning transition-all group relative overflow-hidden"
                >
                  <div className="relative z-10 text-left">
                    <h3 className="text-lg font-bold text-foreground mb-2">{scenario.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{scenario.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-warning">Difficulty: {scenario.difficulty} / 5</span>
                      <span className="text-warning font-semibold">{scenario.durationDays}d</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Abstracted Scenarios */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-12">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" /> Abstracted Patterns
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ABSTRACTED_SCENARIOS.map((scenario, idx) => (
                <motion.button
                  key={scenario.id}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedScenario(scenario);
                    setStage('configure');
                  }}
                  className="p-6 bg-card/60 border-2 border-primary/40 rounded-xl hover:border-primary transition-all group relative overflow-hidden"
                >
                  <div className="relative z-10 text-left">
                    <h3 className="text-lg font-bold text-foreground mb-2">{scenario.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{scenario.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-primary">Difficulty: {scenario.difficulty} / 5</span>
                      <span className="text-primary font-semibold">{scenario.durationDays}d</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Back Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              soundManager.playClick();
              onBack();
            }}
            className="mt-8 px-8 py-3 bg-card hover:bg-muted text-foreground rounded-lg font-semibold transition-all border border-border"
          >
            Back to Menu
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // STAGE 2: Event Configuration
  if (stage === 'configure' && selectedScenario) {
    const enabledEventsList = Object.entries(selectedScenario.events)
      .filter(([_, e]) => e)
      .map(([key]) => key as EventType);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-background p-8"
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
            <h1 className="text-4xl font-black text-foreground mb-2">{selectedScenario.name}</h1>
            <p className="text-muted-foreground">{selectedScenario.description}</p>
          </motion.div>

          {/* Event Toggles */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-card/60 border-2 border-border rounded-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-danger" /> Toggle Market Events
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Enable or disable events to see how market dynamics change. Fewer events = more predictable markets.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {enabledEventsList.map((eventType) => {
                const eventConfig = selectedScenario.events[eventType];
                if (!eventConfig) return null;

                const EventIcon = eventIcons[eventType];

                return (
                  <motion.div
                    key={eventType}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                      enabledEvents[eventType]
                        ? 'bg-danger/10 border-danger/50'
                        : 'bg-muted/40 border-border'
                    }`}
                    onClick={() => {
                      soundManager.playClick();
                      toggleEvent(eventType);
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                          <EventIcon className="h-5 w-5 text-danger" />
                          {eventNames[eventType]}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{eventDescriptions[eventType]}</p>
                      </div>
                      <div className={`text-2xl font-bold ${enabledEvents[eventType] ? 'text-success' : 'text-muted-foreground'}`}>
                        {enabledEvents[eventType] ? '✓' : '✕'}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                      Probability: {(eventConfig.probability * 100).toFixed(0)}% | Intensity: {eventConfig.intensity}/100 | Impact: {(eventConfig.impact * 100).toFixed(0)}%
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Speed Selector */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8">
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Gauge className="h-5 w-5 text-warning" /> Simulation Speed
            </h3>
            <div className="flex gap-3">
              {[1, 2, 4].map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    soundManager.playClick();
                    setSpeed(s);
                  }}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${
                    speed === s
                      ? 'bg-warning text-warning-foreground border-2 border-warning'
                      : 'bg-card text-muted-foreground border-2 border-border hover:border-warning'
                  }`}
                >
                  {s}x Speed
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Simulation Style */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="mb-8">
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" /> Simulation Style
            </h3>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  soundManager.playClick();
                  setInteractiveMode(true);
                }}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  interactiveMode
                    ? 'bg-primary text-primary-foreground border-2 border-primary'
                    : 'bg-card text-muted-foreground border-2 border-border hover:border-primary'
                }`}
              >
                Interactive Decisions
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  soundManager.playClick();
                  setInteractiveMode(false);
                }}
                className={`px-6 py-2 rounded-lg font-bold transition-all ${
                  !interactiveMode
                    ? 'bg-warning text-warning-foreground border-2 border-warning'
                    : 'bg-card text-muted-foreground border-2 border-border hover:border-warning'
                }`}
              >
                Auto Replay
              </motion.button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Interactive mode pauses during key historical moments to test your decisions.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                soundManager.playClick();
                runSimulation(selectedScenario);
              }}
              className="flex-1 px-8 py-4 bg-danger hover:bg-danger/90 text-white font-bold rounded-lg transition-all text-lg flex items-center justify-center gap-2"
            >
              <Play className="h-5 w-5" /> Launch Simulation
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                soundManager.playClick();
                setStage('select');
              }}
              className="px-8 py-4 bg-card hover:bg-muted text-foreground rounded-lg font-semibold transition-all border border-border"
            >
              Back
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  // STAGE 3: Running Simulation
  if (stage === 'running' && selectedScenario && simulationState) {
    const priceChange = simulationState.currentPrice - selectedScenario.basePrice;
    const priceChangePercent = (priceChange / selectedScenario.basePrice) * 100;

    const chartData = simulationState.priceHistory.map((price, idx) => ({
      day: idx,
      price: parseFloat(price.toFixed(2)),
      sentiment: simulationState.snapshots[idx]?.sentiment || 0,
    }));

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-background p-8"
      >
        <div className="max-w-6xl mx-auto">
          {/* Live Header */}
          <motion.div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-black text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-danger" /> LIVE SIMULATION: {selectedScenario.name}
                </h1>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-danger"
              >
                <Skull className="h-8 w-8" />
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden border-2 border-danger">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(progress / selectedScenario.durationDays) * 100}%` }}
                className="h-full bg-danger"
              />
            </div>
            <div className="text-right text-sm text-danger mt-1 font-bold">
              Day {Math.min(Math.floor(progress), selectedScenario.durationDays)} / {selectedScenario.durationDays}
            </div>
          </motion.div>

          <AnimatePresence>
            {lossAlert && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -10 }}
                className="mb-6 rounded-lg border-2 border-danger/50 bg-danger/10 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger/20">
                    <Skull className="h-5 w-5 text-danger" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-danger uppercase tracking-wide">{lossAlert.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{lossAlert.detail}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {pendingDecision && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.98, opacity: 0 }}
                  className="w-full max-w-4xl rounded-xl border-2 border-danger/40 bg-card/95 p-6"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-danger uppercase tracking-wider">Historical Decision</div>
                      <h2 className="text-2xl font-bold text-foreground">{pendingDecision.title}</h2>
                      <p className="text-sm text-muted-foreground mt-2">{pendingDecision.context}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      Day {pendingDecision.day}
                    </div>
                  </div>

                  <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">{pendingDecision.concept.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Formula</div>
                    <div className="font-mono text-sm text-primary">{pendingDecision.concept.formula}</div>
                    <p className="text-xs text-muted-foreground mt-2">{pendingDecision.concept.lesson}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    {pendingDecision.options.map((option) => (
                      <div key={option.id} className="rounded-lg border border-border bg-muted/30 p-4">
                        <h3 className="font-semibold text-foreground mb-2">{option.label}</h3>
                        <p className="text-xs text-muted-foreground mb-3">{option.rationale}</p>
                        <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                          <div>
                            <div className="uppercase tracking-wider">Prob</div>
                            <div className="font-semibold text-foreground">{Math.round(option.probability * 100)}%</div>
                          </div>
                          <div>
                            <div className="uppercase tracking-wider">EV</div>
                            <div className={option.expectedReturn >= 0 ? 'text-success font-semibold' : 'text-danger font-semibold'}>
                              {option.expectedReturn >= 0 ? '+' : ''}{option.expectedReturn}%
                            </div>
                          </div>
                          <div>
                            <div className="uppercase tracking-wider">Vol</div>
                            <div className="font-semibold text-foreground">{option.volatility}%</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDecisionSelect(option)}
                            className="flex-1 rounded-md bg-danger px-3 py-2 text-xs font-semibold text-white hover:bg-danger/90"
                          >
                            Choose
                          </button>
                          <button
                            onClick={() => {
                              soundManager.playClick();
                              setFocusedOption(option);
                            }}
                            className="rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                          >
                            View Impact
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {focusedOption && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
                onClick={() => setFocusedOption(null)}
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.98, opacity: 0 }}
                  className="w-full max-w-lg rounded-xl border-2 border-primary/40 bg-card/95 p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-xs text-primary uppercase tracking-wider">Impact Breakdown</div>
                      <h3 className="text-xl font-bold text-foreground">{focusedOption.label}</h3>
                    </div>
                    <button
                      onClick={() => setFocusedOption(null)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="rounded-md border border-border bg-muted/40 p-3">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Player</div>
                      <div className="text-foreground font-medium">{focusedOption.impacts.player}</div>
                    </div>
                    <div className="rounded-md border border-border bg-muted/40 p-3">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Government</div>
                      <div className="text-foreground font-medium">{focusedOption.impacts.government}</div>
                    </div>
                    <div className="rounded-md border border-border bg-muted/40 p-3">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Economy</div>
                      <div className="text-foreground font-medium">{focusedOption.impacts.economy}</div>
                    </div>
                    <div className="rounded-md border border-border bg-muted/40 p-3">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Billionaires</div>
                      <div className="text-foreground font-medium">{focusedOption.impacts.billionaires}</div>
                    </div>
                    <div className="rounded-md border border-border bg-muted/40 p-3">
                      <div className="text-xs text-muted-foreground uppercase tracking-wider">Middle Class</div>
                      <div className="text-foreground font-medium">{focusedOption.impacts.middleClass}</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card/60 border-2 border-primary/40 rounded-lg p-4"
            >
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Current Price</div>
              <div className="text-3xl font-black text-primary mt-1">${simulationState.currentPrice.toFixed(2)}</div>
              <div className={`text-sm font-bold mt-1 ${priceChangePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="bg-card/60 border-2 border-warning/40 rounded-lg p-4"
            >
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Market Sentiment</div>
              <div className="text-3xl font-black text-warning mt-1">
                {simulationState.sentiment > 0 ? (
                  <TrendingUp className="h-7 w-7 text-success" />
                ) : (
                  <TrendingDown className="h-7 w-7 text-danger" />
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-1 font-semibold">{simulationState.sentiment.toFixed(0)}</div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-card/60 border-2 border-warning/40 rounded-lg p-4"
            >
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Volatility</div>
              <div className="text-3xl font-black text-warning mt-1">{(simulationState.volatility * 100).toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-1">Daily fluctuation</div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-card/60 border-2 border-danger/40 rounded-lg p-4"
            >
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Active Events</div>
              <div className="text-sm font-semibold text-foreground mt-2 flex gap-2 flex-wrap">
                {simulationState.activeEvents.length > 0 ? (
                  simulationState.activeEvents.map((e) => {
                    const EventIcon = eventIcons[e];
                    return (
                      <span key={e} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
                        <EventIcon className="h-3 w-3 text-danger" />
                        {eventNames[e]}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-muted-foreground">None</span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-card/60 border-2 border-border rounded-xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Price Evolution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={['dataMin * 0.95', 'dataMax * 1.05']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '2px solid #06b6d4',
                    borderRadius: '8px',
                    padding: '8px',
                  }}
                  labelStyle={{ color: '#06b6d4' }}
                />
                <Line type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // STAGE 4: Results
  if (stage === 'results' && selectedScenario && simulationState) {
    const results = formatSimulationResults(simulationState, selectedScenario);
    const finalPriceChangePercent = parseFloat(results.priceChangePercent);

    const chartData = simulationState.priceHistory.map((price, idx) => ({
      day: idx,
      price: parseFloat(price.toFixed(2)),
    }));

    const learnings = {
      volatility: simulationState.snapshots.filter((s) => s.volatility > 0.1).length,
      crashes: simulationState.snapshots.filter((s) => s.activeEvents.includes('crash')).length,
      booms: simulationState.snapshots.filter((s) => s.activeEvents.includes('boom')).length,
      panics: simulationState.snapshots.filter((s) => s.activeEvents.includes('panic')).length,
      regulations: simulationState.snapshots.filter((s) => s.activeEvents.includes('regulation')).length,
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-background p-8 overflow-y-auto"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
            <h1 className="text-5xl font-black text-foreground mb-2 flex items-center gap-3">
              <BarChart3 className="h-7 w-7 text-primary" /> SIMULATION COMPLETE
            </h1>
            <p className="text-lg text-muted-foreground">{selectedScenario.name}</p>
          </motion.div>

          {/* Overall Performance */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`mb-8 p-8 rounded-xl border-2 ${
              finalPriceChangePercent >= 0
                ? 'bg-success/10 border-success/50'
                : 'bg-danger/10 border-danger/50'
            }`}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Final Price</div>
                <div className={`text-4xl font-black ${finalPriceChangePercent >= 0 ? 'text-success' : 'text-danger'}`}>
                  ${results.finalPrice}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Total Change</div>
                <div
                  className={`text-4xl font-black ${finalPriceChangePercent >= 0 ? 'text-success' : 'text-danger'}`}
                >
                  {finalPriceChangePercent >= 0 ? '+' : ''}{results.priceChangePercent}%
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Max Drawdown</div>
                <div className="text-4xl font-black text-danger">{results.maxDrawdown}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Final Score</div>
                <div className="text-4xl font-black text-primary">{results.finalScore}</div>
              </div>
            </div>
          </motion.div>

          {/* Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card/60 border-2 border-border rounded-xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Complete Price History
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '2px solid #06b6d4',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#06b6d4' }}
                />
                <Line type="monotone" dataKey="price" stroke="#06b6d4" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
          >
            <div className="bg-card/60 border-2 border-border rounded-lg p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Volatility</div>
              <div className="text-2xl font-black text-warning">{results.volatility}%</div>
            </div>
            <div className="bg-card/60 border-2 border-danger/40 rounded-lg p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Crashes</div>
              <div className="text-2xl font-black text-danger">{learnings.crashes}</div>
            </div>
            <div className="bg-card/60 border-2 border-success/40 rounded-lg p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Booms</div>
              <div className="text-2xl font-black text-success">{learnings.booms}</div>
            </div>
            <div className="bg-card/60 border-2 border-warning/40 rounded-lg p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Panics</div>
              <div className="text-2xl font-black text-warning">{learnings.panics}</div>
            </div>
            <div className="bg-card/60 border-2 border-primary/40 rounded-lg p-4">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Regulations</div>
              <div className="text-2xl font-black text-primary">{learnings.regulations}</div>
            </div>
          </motion.div>

          {/* Insights */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-card/60 border-2 border-border rounded-xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-warning" /> Key Insights for Live Market
            </h3>
            <ul className="space-y-3">
              {finalPriceChangePercent >= 0 ? (
                <>
                  <li className="flex gap-3 text-muted-foreground">
                    <span className="text-success font-bold">✓</span> This market scenario was PROFITABLE (+{Math.abs(finalPriceChangePercent).toFixed(2)}%)
                  </li>
                  <li className="flex gap-3 text-muted-foreground">
                    <span className="text-success font-bold">✓</span> Consider using similar strategies in the live market when market conditions match
                  </li>
                </>
              ) : (
                <>
                  <li className="flex gap-3 text-muted-foreground">
                    <span className="text-danger font-bold">✗</span> This scenario demonstrated a challenging environment ({finalPriceChangePercent.toFixed(2)}%)
                  </li>
                  <li className="flex gap-3 text-muted-foreground">
                    <span className="text-danger font-bold">✗</span> Valuable learning: Practice defensive strategies for similar market conditions
                  </li>
                </>
              )}
              <li className="flex gap-3 text-muted-foreground">
                <span className="text-warning font-bold">!</span> Peak-to-trough volatility: {results.peakToTrough}% - Test your risk management limits
              </li>
              <li className="flex gap-3 text-muted-foreground">
                <span className="text-warning font-bold">!</span> Experienced {learnings.crashes + learnings.panics + learnings.booms + learnings.regulations} market events - Build resilience
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                soundManager.playClick();
                setStage('select');
                setSelectedScenario(null);
                setSimulationState(null);
              }}
              className="flex-1 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg transition-all text-lg flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-5 w-5" /> Run Another Simulation
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                soundManager.playClick();
                onBack();
              }}
              className="px-8 py-4 bg-card hover:bg-muted text-foreground rounded-lg font-semibold transition-all border border-border"
            >
              Back to Menu
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}
