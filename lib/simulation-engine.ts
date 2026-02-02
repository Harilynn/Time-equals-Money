// MARKET SIMULATION ENGINE - Intense scenario-based market evolution
// Test your trading strategies in controlled environments with dynamic events

export type EventType = 'crash' | 'boom' | 'panic' | 'regulation';
export type ScenarioType = 'historical' | 'abstracted';

export interface SimulationEvent {
  type: EventType;
  enabled: boolean;
  intensity: number; // 0-100
  probability: number; // 0-1
  impact: number; // Market impact multiplier
}

export interface MarketSnapshot {
  timestamp: number;
  price: number;
  volatility: number;
  volume: number;
  sentiment: number; // -100 to 100
  activeEvents: EventType[];
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  type: ScenarioType;
  basePrice: number;
  volatilityBase: number;
  durationDays: number;
  difficulty: number; // 1-5
  events: Partial<Record<EventType, SimulationEvent>>;
  historicalBasis?: string;
}

export interface SimulationState {
  currentDay: number;
  totalDays: number;
  currentPrice: number;
  priceHistory: number[];
  sentiment: number;
  volatility: number;
  volume: number;
  portfolio: number; // Starting with 1000 units
  cash: number;
  activeEvents: EventType[];
  eventHistory: SimulationEvent[];
  snapshots: MarketSnapshot[];
  score: number;
  profitLoss: number;
  winRate: number;
  isPaused: boolean;
  speed: number; // 1x, 2x, 4x
}

// HISTORICAL SCENARIOS - Based on real market events
export const HISTORICAL_SCENARIOS: SimulationScenario[] = [
  {
    id: 'dotcom-crash',
    name: '🔴 Dot-Com Crash (2000-2001)',
    description: 'Experience the explosive burst of the tech bubble. Overvalued startups crash while fundamental players stabilize.',
    type: 'historical',
    basePrice: 100,
    volatilityBase: 0.08,
    durationDays: 365,
    difficulty: 4,
    events: {
      crash: {
        type: 'crash',
        enabled: true,
        intensity: 85,
        probability: 0.3,
        impact: -0.45,
      },
      panic: {
        type: 'panic',
        enabled: true,
        intensity: 70,
        probability: 0.2,
        impact: -0.25,
      },
      regulation: {
        type: 'regulation',
        enabled: true,
        intensity: 40,
        probability: 0.15,
        impact: -0.1,
      },
    },
  },
  {
    id: '2008-financial',
    name: '🏚️ 2008 Financial Crisis',
    description: 'Lehman Brothers collapse, credit freeze, forced deleveraging. Markets spiral as fear grips institutions.',
    type: 'historical',
    basePrice: 100,
    volatilityBase: 0.12,
    durationDays: 365,
    difficulty: 5,
    events: {
      crash: {
        type: 'crash',
        enabled: true,
        intensity: 95,
        probability: 0.4,
        impact: -0.6,
      },
      panic: {
        type: 'panic',
        enabled: true,
        intensity: 90,
        probability: 0.35,
        impact: -0.5,
      },
      boom: {
        type: 'boom',
        enabled: true,
        intensity: 10,
        probability: 0.05,
        impact: 0.08,
      },
      regulation: {
        type: 'regulation',
        enabled: true,
        intensity: 60,
        probability: 0.25,
        impact: -0.2,
      },
    },
  },
  {
    id: 'covid-shock',
    name: '🦠 COVID-19 Shock (2020)',
    description: 'Black swan event. Markets crash 30%+ in weeks, then aggressive recovery on policy support.',
    type: 'historical',
    basePrice: 100,
    volatilityBase: 0.15,
    durationDays: 250,
    difficulty: 3,
    events: {
      crash: {
        type: 'crash',
        enabled: true,
        intensity: 80,
        probability: 0.15,
        impact: -0.35,
      },
      panic: {
        type: 'panic',
        enabled: true,
        intensity: 85,
        probability: 0.2,
        impact: -0.4,
      },
      boom: {
        type: 'boom',
        enabled: true,
        intensity: 75,
        probability: 0.25,
        impact: 0.3,
      },
      regulation: {
        type: 'regulation',
        enabled: true,
        intensity: 50,
        probability: 0.1,
        impact: 0.15,
      },
    },
  },
];

// ABSTRACTED SCENARIOS - Generalized market patterns
export const ABSTRACTED_SCENARIOS: SimulationScenario[] = [
  {
    id: 'bull-market',
    name: '📈 Persistent Bull Run',
    description: 'Strong uptrend with minor pullbacks. Fundamental growth drives prices steadily higher.',
    type: 'abstracted',
    basePrice: 100,
    volatilityBase: 0.04,
    durationDays: 200,
    difficulty: 1,
    events: {
      boom: {
        type: 'boom',
        enabled: true,
        intensity: 70,
        probability: 0.3,
        impact: 0.35,
      },
      panic: {
        type: 'panic',
        enabled: true,
        intensity: 20,
        probability: 0.05,
        impact: -0.1,
      },
    },
  },
  {
    id: 'bear-market',
    name: '📉 Brutal Bear Market',
    description: 'Systematic decline with rallies that fail. Sellers overwhelm buyers every day.',
    type: 'abstracted',
    basePrice: 100,
    volatilityBase: 0.07,
    durationDays: 200,
    difficulty: 3,
    events: {
      crash: {
        type: 'crash',
        enabled: true,
        intensity: 65,
        probability: 0.25,
        impact: -0.3,
      },
      panic: {
        type: 'panic',
        enabled: true,
        intensity: 50,
        probability: 0.2,
        impact: -0.2,
      },
      boom: {
        type: 'boom',
        enabled: true,
        intensity: 30,
        probability: 0.1,
        impact: 0.15,
      },
    },
  },
  {
    id: 'extreme-volatility',
    name: '⚡ Extreme Volatility Gauntlet',
    description: 'Wild swings in both directions. +20% or -20% moves are common. Profitable for day traders, deadly for hodlers.',
    type: 'abstracted',
    basePrice: 100,
    volatilityBase: 0.18,
    durationDays: 150,
    difficulty: 4,
    events: {
      boom: {
        type: 'boom',
        enabled: true,
        intensity: 80,
        probability: 0.25,
        impact: 0.4,
      },
      crash: {
        type: 'crash',
        enabled: true,
        intensity: 80,
        probability: 0.25,
        impact: -0.4,
      },
      panic: {
        type: 'panic',
        enabled: true,
        intensity: 70,
        probability: 0.15,
        impact: -0.3,
      },
    },
  },
  {
    id: 'regulation-storm',
    name: '⚖️ Regulatory Storm',
    description: 'Government intervention and policy changes dominate. Expect restrictions, taxes, and surprise announcements.',
    type: 'abstracted',
    basePrice: 100,
    volatilityBase: 0.1,
    durationDays: 180,
    difficulty: 3,
    events: {
      regulation: {
        type: 'regulation',
        enabled: true,
        intensity: 85,
        probability: 0.4,
        impact: -0.25,
      },
      crash: {
        type: 'crash',
        enabled: true,
        intensity: 45,
        probability: 0.15,
        impact: -0.2,
      },
      boom: {
        type: 'boom',
        enabled: true,
        intensity: 35,
        probability: 0.1,
        impact: 0.2,
      },
    },
  },
  {
    id: 'custom-chaos',
    name: '🎲 Pure Chaos (All Events)',
    description: 'Every event enabled at MAX intensity. Only for traders with nerves of steel.',
    type: 'abstracted',
    basePrice: 100,
    volatilityBase: 0.2,
    durationDays: 100,
    difficulty: 5,
    events: {
      boom: {
        type: 'boom',
        enabled: true,
        intensity: 100,
        probability: 0.25,
        impact: 0.5,
      },
      crash: {
        type: 'crash',
        enabled: true,
        intensity: 100,
        probability: 0.25,
        impact: -0.5,
      },
      panic: {
        type: 'panic',
        enabled: true,
        intensity: 100,
        probability: 0.2,
        impact: -0.4,
      },
      regulation: {
        type: 'regulation',
        enabled: true,
        intensity: 100,
        probability: 0.15,
        impact: -0.3,
      },
    },
  },
];

// Initialize simulation state
export function createSimulationState(scenario: SimulationScenario): SimulationState {
  return {
    currentDay: 0,
    totalDays: scenario.durationDays,
    currentPrice: scenario.basePrice,
    priceHistory: [scenario.basePrice],
    sentiment: 0,
    volatility: scenario.volatilityBase,
    volume: 1000000,
    portfolio: 1000,
    cash: 10000,
    activeEvents: [],
    eventHistory: [],
    snapshots: [],
    score: 0,
    profitLoss: 0,
    winRate: 0.5,
    isPaused: false,
    speed: 1,
  };
}

// Seeded random for deterministic simulation
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

// Core simulation step - advance market by 1 day
export function simulateDay(
  state: SimulationState,
  scenario: SimulationScenario,
  dayIndex: number
): SimulationState {
  const rng = new SeededRandom(dayIndex * 12345 + scenario.durationDays);

  // Determine active events
  const activeEvents: EventType[] = [];
  const enabledEvents = Object.entries(scenario.events).filter(([_, e]) => e?.enabled) as [EventType, SimulationEvent][];

  for (const [eventType, event] of enabledEvents) {
    if (rng.next() < event.probability) {
      activeEvents.push(eventType);
    }
  }

  // Calculate price movement
  let priceChange = 0;
  let sentimentDelta = 0;

  // Base random walk with drift
  const baseMove = (rng.next() - 0.5) * 2 * state.volatility;
  priceChange += baseMove;

  // Apply event impacts
  for (const eventType of activeEvents) {
    const event = scenario.events[eventType];
    if (event) {
      const eventMagnitude = (event.intensity / 100) * event.impact;
      priceChange += eventMagnitude;

      if (eventType === 'boom') sentimentDelta += 30;
      if (eventType === 'crash') sentimentDelta -= 40;
      if (eventType === 'panic') sentimentDelta -= 35;
      if (eventType === 'regulation') sentimentDelta -= 15;
    }
  }

  // Sentiment mean reversion
  sentimentDelta += state.sentiment * -0.05;

  // Volatility adjustment based on events
  let newVolatility = state.volatility;
  if (activeEvents.length > 0) {
    newVolatility *= 1 + activeEvents.length * 0.1;
  } else {
    newVolatility *= 0.95; // Decay back to baseline
  }
  newVolatility = Math.max(scenario.volatilityBase * 0.5, Math.min(0.3, newVolatility));

  // Volume surge during events
  let newVolume = state.volume * (0.8 + rng.next() * 0.4);
  if (activeEvents.length > 0) {
    newVolume *= 1 + activeEvents.length * 1.5;
  }

  // Calculate new price
  const newPrice = Math.max(state.currentPrice * (1 + priceChange), state.currentPrice * 0.01);
  const priceHistoryWithNewPrice = [...state.priceHistory, newPrice];

  // Update sentiment
  const newSentiment = Math.max(-100, Math.min(100, state.sentiment + sentimentDelta));

  // Calculate score (profit/loss + sentiment alignment)
  const dayPnL = newPrice - state.currentPrice;
  const newScore = state.score + (dayPnL / state.currentPrice) * 100;

  // Create snapshot
  const snapshot: MarketSnapshot = {
    timestamp: state.currentDay,
    price: newPrice,
    volatility: newVolatility,
    volume: newVolume,
    sentiment: newSentiment,
    activeEvents,
  };

  return {
    ...state,
    currentDay: state.currentDay + 1,
    currentPrice: newPrice,
    priceHistory: priceHistoryWithNewPrice,
    sentiment: newSentiment,
    volatility: newVolatility,
    volume: newVolume,
    activeEvents,
    eventHistory: [...state.eventHistory, ...activeEvents.map((e) => scenario.events[e]!)],
    snapshots: [...state.snapshots, snapshot],
    score: newScore,
    profitLoss: newPrice - scenario.basePrice,
  };
}

// Run fast simulation
export function runFastSimulation(
  scenario: SimulationScenario,
  enabledEvents: Partial<Record<EventType, boolean>>,
): SimulationState {
  let state = createSimulationState(scenario);

  // Update scenario events based on toggles
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

  for (let i = 0; i < scenario.durationDays; i++) {
    state = simulateDay(state, modifiedScenario, i);
  }

  return state;
}

// Get scenario recommendations based on player stats
export function getRecommendedScenarios(
  playerLevel: number,
  totalTimeEarned: number,
  streak: number,
): SimulationScenario[] {
  const allScenarios = [...HISTORICAL_SCENARIOS, ...ABSTRACTED_SCENARIOS];

  // Filter by difficulty
  const filtered = allScenarios.filter((s) => {
    if (playerLevel < 2) return s.difficulty <= 2;
    if (playerLevel < 4) return s.difficulty <= 3;
    return true;
  });

  // Sort by relevance
  return filtered.sort(() => Math.random() - 0.5).slice(0, 3);
}

// Format scenario results for display
export function formatSimulationResults(state: SimulationState, scenario: SimulationScenario) {
  const priceChange = state.currentPrice - scenario.basePrice;
  const priceChangePercent = (priceChange / scenario.basePrice) * 100;
  const maxPrice = Math.max(...state.priceHistory);
  const minPrice = Math.min(...state.priceHistory);
  const maxDrawdown = ((minPrice - scenario.basePrice) / scenario.basePrice) * 100;
  const peakToTrough = ((maxPrice - minPrice) / minPrice) * 100;

  return {
    finalPrice: state.currentPrice.toFixed(2),
    priceChangePercent: priceChangePercent.toFixed(2),
    maxDrawdown: maxDrawdown.toFixed(2),
    peakToTrough: peakToTrough.toFixed(2),
    sentiment: state.sentiment,
    volatility: (state.volatility * 100).toFixed(1),
    totalEventCount: state.eventHistory.length,
    finalScore: Math.round(state.score),
  };
}
