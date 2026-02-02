'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HISTORICAL_SCENARIOS,
  ABSTRACTED_SCENARIOS,
  SimulationScenario,
  SimulationState,
  EventType,
  runFastSimulation,
  formatSimulationResults,
  createSimulationState,
  simulateDay,
} from '@/lib/simulation-engine';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar } from 'recharts';

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

  const allScenarios = [...HISTORICAL_SCENARIOS, ...ABSTRACTED_SCENARIOS];

  // Run simulation
  const runSimulation = (scenario: SimulationScenario) => {
    setSelectedScenario(scenario);
    setIsRunning(true);
    setProgress(0);

    let state = createSimulationState(scenario);
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

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= scenario.durationDays) {
          clearInterval(interval);
          setIsRunning(false);
          setStage('results');
          return scenario.durationDays;
        }
        state = simulateDay(state, modifiedScenario, p);
        setSimulationState({ ...state });
        return p + (10 / speed);
      });
    }, 100 / speed);
  };

  const toggleEvent = (eventType: EventType) => {
    setEnabledEvents((prev) => ({
      ...prev,
      [eventType]: !prev[eventType],
    }));
  };

  // STAGE 1: Scenario Selection
  if (stage === 'select') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 overflow-y-auto"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-12">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2">
              📊 MARKET SIMULATION
            </h1>
            <p className="text-lg text-gray-300">Experience real and abstracted market scenarios without risking your life</p>
            <p className="text-sm text-gray-400 mt-2">
              Learn market dynamics, test strategies, and prepare for the Live Market challenge
            </p>
          </motion.div>

          {/* Historical Scenarios */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mb-12">
            <h2 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">📖</span> Historical Events
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
                    setSelectedScenario(scenario);
                    setStage('configure');
                  }}
                  className="p-6 bg-gradient-to-br from-amber-950 via-orange-900 to-red-900 border-2 border-amber-600 rounded-xl hover:border-amber-400 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative z-10 text-left">
                    <h3 className="text-lg font-bold text-amber-300 mb-2">{scenario.name}</h3>
                    <p className="text-sm text-gray-200 mb-3 line-clamp-2">{scenario.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-400">Difficulty: {Array(scenario.difficulty).fill('⚡').join('')}</span>
                      <span className="text-amber-300 font-semibold">{scenario.durationDays}d</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Abstracted Scenarios */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="mb-12">
            <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎲</span> Abstracted Patterns
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
                    setSelectedScenario(scenario);
                    setStage('configure');
                  }}
                  className="p-6 bg-gradient-to-br from-blue-950 via-indigo-900 to-purple-900 border-2 border-blue-600 rounded-xl hover:border-blue-400 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  <div className="relative z-10 text-left">
                    <h3 className="text-lg font-bold text-blue-300 mb-2">{scenario.name}</h3>
                    <p className="text-sm text-gray-200 mb-3 line-clamp-2">{scenario.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-400">Difficulty: {Array(scenario.difficulty).fill('⚡').join('')}</span>
                      <span className="text-blue-300 font-semibold">{scenario.durationDays}d</span>
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
            onClick={onBack}
            className="mt-8 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-gray-200 rounded-lg font-semibold transition-all border border-slate-600"
          >
            ← Back to Menu
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
        className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8"
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
              {selectedScenario.name}
            </h1>
            <p className="text-gray-300">{selectedScenario.description}</p>
          </motion.div>

          {/* Event Toggles */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-600 rounded-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">⚙️ Toggle Market Events</h2>
            <p className="text-sm text-gray-400 mb-6">
              Enable or disable events to see how market dynamics change. Fewer events = more predictable markets.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {enabledEventsList.map((eventType) => {
                const eventConfig = selectedScenario.events[eventType];
                if (!eventConfig) return null;

                const eventEmojis = {
                  boom: '📈',
                  crash: '📉',
                  panic: '😱',
                  regulation: '⚖️',
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

                return (
                  <motion.div
                    key={eventType}
                    whileHover={{ scale: 1.02 }}
                    className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${
                      enabledEvents[eventType]
                        ? 'bg-gradient-to-br from-cyan-900 to-blue-900 border-cyan-500'
                        : 'bg-slate-700 border-slate-600'
                    }`}
                    onClick={() => toggleEvent(eventType)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
                          <span className="text-2xl">{eventEmojis[eventType]}</span>
                          {eventNames[eventType]}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">{eventDescriptions[eventType]}</p>
                      </div>
                      <div className={`text-2xl font-bold ${enabledEvents[eventType] ? 'text-green-400' : 'text-gray-500'}`}>
                        {enabledEvents[eventType] ? '✓' : '✕'}
                      </div>
                    </div>
                    <div className="text-xs text-gray-300 pt-2 border-t border-cyan-700">
                      Probability: {(eventConfig.probability * 100).toFixed(0)}% | Intensity: {eventConfig.intensity}/100 | Impact: {(eventConfig.impact * 100).toFixed(0)}%
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Speed Selector */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="mb-8">
            <h3 className="text-lg font-bold text-purple-400 mb-3">⚡ Simulation Speed</h3>
            <div className="flex gap-3">
              {[1, 2, 4].map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSpeed(s)}
                  className={`px-6 py-2 rounded-lg font-bold transition-all ${
                    speed === s
                      ? 'bg-purple-600 text-white border-2 border-purple-400'
                      : 'bg-slate-800 text-gray-300 border-2 border-slate-700 hover:border-purple-600'
                  }`}
                >
                  {s}x Speed
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => runSimulation(selectedScenario)}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg transition-all text-lg"
            >
              🚀 Launch Simulation
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setStage('select')}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-gray-200 rounded-lg font-semibold transition-all"
            >
              ← Back
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
        className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8"
      >
        <div className="max-w-6xl mx-auto">
          {/* Live Header */}
          <motion.div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 flex items-center gap-2">
                  🔴 LIVE SIMULATION: {selectedScenario.name}
                </h1>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-4xl"
              >
                ⚡
              </motion.div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border-2 border-red-600">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(progress / selectedScenario.durationDays) * 100}%` }}
                className="h-full bg-gradient-to-r from-red-600 to-orange-500"
              />
            </div>
            <div className="text-right text-sm text-red-400 mt-1 font-bold">
              Day {Math.min(Math.floor(progress), selectedScenario.durationDays)} / {selectedScenario.durationDays}
            </div>
          </motion.div>

          {/* Live Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-600 rounded-lg p-4"
            >
              <div className="text-xs text-gray-400 uppercase tracking-wider">Current Price</div>
              <div className="text-3xl font-black text-cyan-400 mt-1">${simulationState.currentPrice.toFixed(2)}</div>
              <div className={`text-sm font-bold mt-1 ${priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-600 rounded-lg p-4"
            >
              <div className="text-xs text-gray-400 uppercase tracking-wider">Market Sentiment</div>
              <div className="text-3xl font-black text-purple-400 mt-1">{simulationState.sentiment > 0 ? '📈' : '📉'}</div>
              <div className="text-sm text-gray-300 mt-1 font-semibold">{simulationState.sentiment.toFixed(0)}</div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-600 rounded-lg p-4"
            >
              <div className="text-xs text-gray-400 uppercase tracking-wider">Volatility</div>
              <div className="text-3xl font-black text-yellow-400 mt-1">{(simulationState.volatility * 100).toFixed(1)}%</div>
              <div className="text-xs text-gray-400 mt-1">Daily fluctuation</div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-pink-600 rounded-lg p-4"
            >
              <div className="text-xs text-gray-400 uppercase tracking-wider">Active Events</div>
              <div className="text-2xl font-black text-pink-400 mt-1 flex gap-1 flex-wrap">
                {simulationState.activeEvents.length > 0 ? (
                  simulationState.activeEvents.map((e) => {
                    const emojis = { boom: '📈', crash: '📉', panic: '😱', regulation: '⚖️' };
                    return <span key={e}>{emojis[e]}</span>;
                  })
                ) : (
                  <span className="text-gray-500">None</span>
                )}
              </div>
            </motion.div>
          </div>

          {/* Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-600 rounded-xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-cyan-400 mb-4">📊 Price Evolution</h3>
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
        className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 overflow-y-auto"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-2">
              ✅ SIMULATION COMPLETE
            </h1>
            <p className="text-lg text-gray-300">{selectedScenario.name}</p>
          </motion.div>

          {/* Overall Performance */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className={`mb-8 p-8 rounded-xl border-2 ${
              finalPriceChangePercent >= 0
                ? 'bg-gradient-to-br from-green-950 to-emerald-950 border-green-500'
                : 'bg-gradient-to-br from-red-950 to-orange-950 border-red-500'
            }`}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-300 uppercase tracking-wider mb-2">Final Price</div>
                <div className={`text-4xl font-black ${finalPriceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${results.finalPrice}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-300 uppercase tracking-wider mb-2">Total Change</div>
                <div
                  className={`text-4xl font-black ${finalPriceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {finalPriceChangePercent >= 0 ? '+' : ''}{results.priceChangePercent}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-300 uppercase tracking-wider mb-2">Max Drawdown</div>
                <div className="text-4xl font-black text-red-400">{results.maxDrawdown}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-300 uppercase tracking-wider mb-2">Final Score</div>
                <div className="text-4xl font-black text-yellow-400">{results.finalScore}</div>
              </div>
            </div>
          </motion.div>

          {/* Chart */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-cyan-600 rounded-xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-cyan-400 mb-4">📊 Complete Price History</h3>
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
            <div className="bg-gradient-to-br from-blue-950 to-cyan-950 border-2 border-blue-600 rounded-lg p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Volatility</div>
              <div className="text-2xl font-black text-blue-400">{results.volatility}%</div>
            </div>
            <div className="bg-gradient-to-br from-red-950 to-orange-950 border-2 border-red-600 rounded-lg p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Crashes</div>
              <div className="text-2xl font-black text-red-400">{learnings.crashes}</div>
            </div>
            <div className="bg-gradient-to-br from-green-950 to-emerald-950 border-2 border-green-600 rounded-lg p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Booms</div>
              <div className="text-2xl font-black text-green-400">{learnings.booms}</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-950 to-orange-950 border-2 border-yellow-600 rounded-lg p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Panics</div>
              <div className="text-2xl font-black text-yellow-400">{learnings.panics}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-950 to-indigo-950 border-2 border-purple-600 rounded-lg p-4">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">Regulations</div>
              <div className="text-2xl font-black text-purple-400">{learnings.regulations}</div>
            </div>
          </motion.div>

          {/* Insights */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-purple-600 rounded-xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-purple-400 mb-4">💡 Key Insights for Live Market</h3>
            <ul className="space-y-3">
              {finalPriceChangePercent >= 0 ? (
                <>
                  <li className="flex gap-3 text-gray-300">
                    <span className="text-green-400 font-bold">✓</span> This market scenario was PROFITABLE (+{Math.abs(finalPriceChangePercent).toFixed(2)}%)
                  </li>
                  <li className="flex gap-3 text-gray-300">
                    <span className="text-green-400 font-bold">✓</span> Consider using similar strategies in the live market when market conditions match
                  </li>
                </>
              ) : (
                <>
                  <li className="flex gap-3 text-gray-300">
                    <span className="text-red-400 font-bold">✗</span> This scenario demonstrated a challenging environment ({finalPriceChangePercent.toFixed(2)}%)
                  </li>
                  <li className="flex gap-3 text-gray-300">
                    <span className="text-red-400 font-bold">✗</span> Valuable learning: Practice defensive strategies for similar market conditions
                  </li>
                </>
              )}
              <li className="flex gap-3 text-gray-300">
                <span className="text-yellow-400 font-bold">!</span> Peak-to-trough volatility: {results.peakToTrough}% - Test your risk management limits
              </li>
              <li className="flex gap-3 text-gray-300">
                <span className="text-yellow-400 font-bold">!</span> Experienced {learnings.crashes + learnings.panics + learnings.booms + learnings.regulations} market events - Build resilience
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setStage('select');
                setSelectedScenario(null);
                setSimulationState(null);
              }}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-lg transition-all text-lg"
            >
              🔄 Run Another Simulation
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-gray-200 rounded-lg font-semibold transition-all"
            >
              ← Back to Menu
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}
