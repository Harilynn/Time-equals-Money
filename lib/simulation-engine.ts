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
  decisions?: SimulationDecision[];
}

export interface SimulationDecisionImpactProfile {
  player: string;
  government: string;
  economy: string;
  billionaires: string;
  middleClass: string;
}

export interface SimulationDecisionOption {
  id: string;
  label: string;
  rationale: string;
  probability: number; // 0-1
  expectedReturn: number; // % expected
  volatility: number; // %
  impacts: SimulationDecisionImpactProfile;
  effects: {
    priceShock: number; // % change applied immediately
    sentiment: number; // +/- points
    volatility: number; // multiplier delta
    score: number; // score boost/penalty
  };
}

export interface SimulationDecisionConcept {
  name: string;
  formula: string;
  lesson: string;
}

export interface SimulationDecision {
  id: string;
  day: number;
  title: string;
  context: string;
  concept: SimulationDecisionConcept;
  options: SimulationDecisionOption[];
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
    name: 'Dot-Com Crash (2000-2001)',
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
    decisions: [
      {
        id: 'dotcom-ipo-frenzy',
        day: 45,
        title: 'IPO Frenzy Peaks',
        context: 'Retail money piles into unprofitable tech listings. The market rewards growth stories, but fundamentals lag.',
        concept: {
          name: 'Survivorship Bias',
          formula: 'Selection bias toward survivors',
          lesson: 'Winners are visible, failures are hidden. Price momentum can mask weak fundamentals.',
        },
        options: [
          {
            id: 'avoid-hype',
            label: 'Avoid the hype and stay defensive',
            rationale: 'Preserve capital and wait for valuations to normalize.',
            probability: 0.62,
            expectedReturn: -2,
            volatility: 6,
            impacts: {
              player: 'Capital preserved, slower growth',
              government: 'Neutral tax receipts',
              economy: 'Speculation cools modestly',
              billionaires: 'Miss explosive upside',
              middleClass: 'Lower drawdown risk',
            },
            effects: { priceShock: -0.02, sentiment: -6, volatility: -0.05, score: 2 },
          },
          {
            id: 'selective-ipo',
            label: 'Selective exposure to quality leaders',
            rationale: 'Target firms with real revenue and cash runway.',
            probability: 0.52,
            expectedReturn: 6,
            volatility: 12,
            impacts: {
              player: 'Moderate upside with measured risk',
              government: 'Stable tax intake',
              economy: 'Capital flows to stronger firms',
              billionaires: 'Capture some upside',
              middleClass: 'Reduced downside vs broad hype',
            },
            effects: { priceShock: 0.03, sentiment: 4, volatility: 0.06, score: 4 },
          },
          {
            id: 'all-in-hype',
            label: 'All-in on hot IPOs',
            rationale: 'Momentum could explode, but downside is severe.',
            probability: 0.35,
            expectedReturn: 14,
            volatility: 22,
            impacts: {
              player: 'High upside, catastrophic drawdown risk',
              government: 'Short-term tax pop, long-term collapse risk',
              economy: 'Speculation intensifies',
              billionaires: 'Disproportionate gains',
              middleClass: 'Largest losses when bubble bursts',
            },
            effects: { priceShock: 0.07, sentiment: 12, volatility: 0.18, score: -2 },
          },
        ],
      },
      {
        id: 'dotcom-capitulation',
        day: 180,
        title: 'Capitulation Wave',
        context: 'Liquidity dries up, earnings disappointments spread, and forced selling accelerates losses.',
        concept: {
          name: 'Drawdown',
          formula: 'Drawdown = (Peak - Current) / Peak',
          lesson: 'Deep drawdowns demand large recoveries. Defense can outperform in crashes.',
        },
        options: [
          {
            id: 'cut-exposure',
            label: 'Cut exposure and raise cash',
            rationale: 'Reduce volatility and protect remaining capital.',
            probability: 0.65,
            expectedReturn: -4,
            volatility: 7,
            impacts: {
              player: 'Limits losses, lower rebound participation',
              government: 'Lower capital gains tax',
              economy: 'Deleveraging accelerates',
              billionaires: 'De-risking preserves wealth',
              middleClass: 'Less forced liquidation',
            },
            effects: { priceShock: -0.03, sentiment: -8, volatility: -0.08, score: 3 },
          },
          {
            id: 'hold-core',
            label: 'Hold core positions only',
            rationale: 'Stay invested in survivors while cutting weakest names.',
            probability: 0.5,
            expectedReturn: 3,
            volatility: 12,
            impacts: {
              player: 'Balanced exposure, still volatile',
              government: 'Stable tax base',
              economy: 'Capital shifts to stronger firms',
              billionaires: 'Selective winners survive',
              middleClass: 'Some recovery participation',
            },
            effects: { priceShock: 0.01, sentiment: 3, volatility: 0.05, score: 4 },
          },
          {
            id: 'average-down',
            label: 'Average down aggressively',
            rationale: 'Bet on a sharp rebound despite weak fundamentals.',
            probability: 0.3,
            expectedReturn: 12,
            volatility: 20,
            impacts: {
              player: 'Large upside if rebound hits, severe downside if not',
              government: 'Short-term capital inflows',
              economy: 'Speculation remains elevated',
              billionaires: 'Potential windfall buys',
              middleClass: 'Largest wipeout risk',
            },
            effects: { priceShock: 0.05, sentiment: 10, volatility: 0.15, score: -3 },
          },
        ],
      },
    ],
  },
  {
    id: '2008-financial',
    name: '2008 Financial Crisis',
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
    decisions: [
      {
        id: '2008-leverage',
        day: 40,
        title: 'Leverage Unwinds',
        context: 'Bank funding dries up and margin calls accelerate forced selling.',
        concept: {
          name: 'Over-leveraging',
          formula: 'Leverage = Total Exposure / Capital',
          lesson: 'High leverage turns small losses into catastrophic collapses.',
        },
        options: [
          {
            id: 'delever',
            label: 'De-lever and reduce exposure',
            rationale: 'Lower risk and protect against forced liquidation.',
            probability: 0.62,
            expectedReturn: -3,
            volatility: 8,
            impacts: {
              player: 'Survival-focused, muted upside',
              government: 'Lower systemic risk',
              economy: 'Credit contraction accelerates',
              billionaires: 'Preserve capital',
              middleClass: 'Less exposure to collapse',
            },
            effects: { priceShock: -0.04, sentiment: -10, volatility: -0.1, score: 3 },
          },
          {
            id: 'stay-invested',
            label: 'Stay invested but hedge',
            rationale: 'Balance downside protection with recovery potential.',
            probability: 0.5,
            expectedReturn: 4,
            volatility: 14,
            impacts: {
              player: 'Moderate losses, some rebound capture',
              government: 'Continued market participation',
              economy: 'Partial stabilization',
              billionaires: 'Selective preservation',
              middleClass: 'Mixed outcomes',
            },
            effects: { priceShock: 0.0, sentiment: 2, volatility: 0.05, score: 4 },
          },
          {
            id: 'double-down',
            label: 'Double down on financials',
            rationale: 'Bet on bailouts and rapid recovery.',
            probability: 0.28,
            expectedReturn: 16,
            volatility: 24,
            impacts: {
              player: 'High upside, severe tail risk',
              government: 'Bailout pressure rises',
              economy: 'Speculation persists',
              billionaires: 'Potential windfall',
              middleClass: 'Largest downside exposure',
            },
            effects: { priceShock: 0.08, sentiment: 12, volatility: 0.2, score: -4 },
          },
        ],
      },
      {
        id: '2008-liquidity-freeze',
        day: 140,
        title: 'Liquidity Freeze',
        context: 'Credit markets lock up, spreads explode, and forced sales ripple across assets.',
        concept: {
          name: 'Liquidity Risk',
          formula: 'Bid-Ask Spread ∝ Stress',
          lesson: 'When liquidity vanishes, even good assets fall quickly.',
        },
        options: [
          {
            id: 'cash-preserve',
            label: 'Move to cash and wait',
            rationale: 'Protect capital until spreads normalize.',
            probability: 0.6,
            expectedReturn: -2,
            volatility: 7,
            impacts: {
              player: 'Protects downside, misses some rebound',
              government: 'Lower market activity',
              economy: 'Tight credit conditions persist',
              billionaires: 'Capital preservation',
              middleClass: 'Less forced liquidation',
            },
            effects: { priceShock: -0.03, sentiment: -6, volatility: -0.08, score: 3 },
          },
          {
            id: 'rotate-defensive',
            label: 'Rotate into defensive sectors',
            rationale: 'Seek stability while staying invested.',
            probability: 0.5,
            expectedReturn: 5,
            volatility: 12,
            impacts: {
              player: 'Moderate drawdown, moderate recovery',
              government: 'Smoother tax receipts',
              economy: 'Capital reallocation to stability',
              billionaires: 'Steady returns',
              middleClass: 'More stable outcomes',
            },
            effects: { priceShock: 0.02, sentiment: 4, volatility: 0.04, score: 4 },
          },
          {
            id: 'illiquid-bet',
            label: 'Buy distressed illiquid assets',
            rationale: 'Deep discounts but exit risk is extreme.',
            probability: 0.25,
            expectedReturn: 18,
            volatility: 26,
            impacts: {
              player: 'Huge upside, very high drawdown risk',
              government: 'Potential stability if rescues work',
              economy: 'Speculation continues',
              billionaires: 'Major opportunity',
              middleClass: 'Largest downside risk',
            },
            effects: { priceShock: 0.09, sentiment: 14, volatility: 0.22, score: -5 },
          },
        ],
      },
    ],
  },
  {
    id: 'covid-shock',
    name: 'COVID-19 Shock (2020)',
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
    decisions: [
      {
        id: 'covid-lockdown',
        day: 20,
        title: 'Lockdown Shock',
        context: 'Supply chains stall and demand collapses. Volatility spikes as uncertainty dominates.',
        concept: {
          name: 'Tail Risk',
          formula: 'P(extreme move) > normal assumptions',
          lesson: 'Rare shocks dominate outcomes. Plan for extreme downside.',
        },
        options: [
          {
            id: 'risk-off',
            label: 'Move risk-off immediately',
            rationale: 'Preserve capital while visibility is low.',
            probability: 0.64,
            expectedReturn: -1,
            volatility: 8,
            impacts: {
              player: 'Capital protection, muted upside',
              government: 'Reduced market activity',
              economy: 'Confidence drops',
              billionaires: 'Preserve capital',
              middleClass: 'Lower exposure to drawdowns',
            },
            effects: { priceShock: -0.02, sentiment: -6, volatility: -0.08, score: 3 },
          },
          {
            id: 'barbell',
            label: 'Barbell: cash + resilient sectors',
            rationale: 'Balance downside protection with selective upside.',
            probability: 0.52,
            expectedReturn: 6,
            volatility: 14,
            impacts: {
              player: 'Balanced outcomes, moderate volatility',
              government: 'Stabilizes sector funding',
              economy: 'Capital supports essential services',
              billionaires: 'Selective winners',
              middleClass: 'Moderate drawdown risk',
            },
            effects: { priceShock: 0.02, sentiment: 4, volatility: 0.05, score: 4 },
          },
          {
            id: 'buy-the-dip',
            label: 'Buy the dip aggressively',
            rationale: 'Bet on rapid policy response and rebound.',
            probability: 0.32,
            expectedReturn: 15,
            volatility: 22,
            impacts: {
              player: 'Large upside if rebound hits, deep downside risk',
              government: 'Pressure for intervention',
              economy: 'Speculative capital rises',
              billionaires: 'Potential outsized gains',
              middleClass: 'Largest drawdown risk',
            },
            effects: { priceShock: 0.07, sentiment: 10, volatility: 0.18, score: -3 },
          },
        ],
      },
      {
        id: 'covid-stimulus',
        day: 90,
        title: 'Stimulus Wave',
        context: 'Massive fiscal and monetary support lifts risk assets despite weak fundamentals.',
        concept: {
          name: 'Liquidity Driven Rallies',
          formula: 'Price ≠ Fundamentals (short term)',
          lesson: 'Policy liquidity can overpower fundamentals in the short run.',
        },
        options: [
          {
            id: 'stay-defensive',
            label: 'Stay defensive and wait',
            rationale: 'Avoid overextension in a liquidity-driven rally.',
            probability: 0.58,
            expectedReturn: 2,
            volatility: 9,
            impacts: {
              player: 'Lower risk, reduced upside',
              government: 'Stable markets',
              economy: 'Slow recovery participation',
              billionaires: 'Less upside capture',
              middleClass: 'Lower volatility exposure',
            },
            effects: { priceShock: -0.01, sentiment: -2, volatility: -0.05, score: 2 },
          },
          {
            id: 'rotate-growth',
            label: 'Rotate into growth winners',
            rationale: 'Benefit from liquidity without chasing every spike.',
            probability: 0.5,
            expectedReturn: 8,
            volatility: 14,
            impacts: {
              player: 'Balanced risk and return',
              government: 'Tax receipts stabilize',
              economy: 'Capital supports tech leadership',
              billionaires: 'Large gains on winners',
              middleClass: 'Moderate volatility',
            },
            effects: { priceShock: 0.03, sentiment: 5, volatility: 0.06, score: 4 },
          },
          {
            id: 'chase-rally',
            label: 'Chase the rally hard',
            rationale: 'Go all-in expecting momentum to persist.',
            probability: 0.34,
            expectedReturn: 16,
            volatility: 22,
            impacts: {
              player: 'High upside with reversal risk',
              government: 'Speculation concerns rise',
              economy: 'Asset inflation risk',
              billionaires: 'Disproportionate gains',
              middleClass: 'Largest drawdown risk',
            },
            effects: { priceShock: 0.08, sentiment: 12, volatility: 0.18, score: -2 },
          },
        ],
      },
    ],
  },
];

// ABSTRACTED SCENARIOS - Generalized market patterns
export const ABSTRACTED_SCENARIOS: SimulationScenario[] = [
  {
    id: 'bull-market',
    name: 'Persistent Bull Run',
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
    decisions: [
      {
        id: 'bull-momentum',
        day: 60,
        title: 'Momentum Versus Discipline',
        context: 'The uptrend tempts you to increase exposure despite rising valuations.',
        concept: {
          name: 'Risk-Reward Ratio',
          formula: 'R:R = Potential Gain / Potential Loss',
          lesson: 'As prices rise, reward shrinks and downside risk grows.',
        },
        options: [
          {
            id: 'rebalance',
            label: 'Rebalance and lock gains',
            rationale: 'Reduce risk while the trend is strong.',
            probability: 0.6,
            expectedReturn: 4,
            volatility: 6,
            impacts: {
              player: 'Stabilizes gains',
              government: 'Stable tax base',
              economy: 'Moderates asset inflation',
              billionaires: 'Smaller gains',
              middleClass: 'Less downside risk',
            },
            effects: { priceShock: -0.01, sentiment: -2, volatility: -0.05, score: 3 },
          },
          {
            id: 'ride-trend',
            label: 'Ride the trend',
            rationale: 'Stay invested while momentum is positive.',
            probability: 0.55,
            expectedReturn: 8,
            volatility: 10,
            impacts: {
              player: 'Solid upside with manageable risk',
              government: 'Higher tax receipts',
              economy: 'Capital supports growth',
              billionaires: 'Strong gains',
              middleClass: 'Participates in upside',
            },
            effects: { priceShock: 0.03, sentiment: 5, volatility: 0.05, score: 4 },
          },
          {
            id: 'leverage-up',
            label: 'Add leverage to maximize gains',
            rationale: 'Amplify returns while trend holds.',
            probability: 0.35,
            expectedReturn: 14,
            volatility: 18,
            impacts: {
              player: 'High upside, sharper drawdowns',
              government: 'Speculation risk increases',
              economy: 'Volatility can spike',
              billionaires: 'Outsized gains',
              middleClass: 'Higher downside risk',
            },
            effects: { priceShock: 0.06, sentiment: 10, volatility: 0.12, score: -2 },
          },
        ],
      },
    ],
  },
  {
    id: 'bear-market',
    name: 'Brutal Bear Market',
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
    decisions: [
      {
        id: 'bear-defense',
        day: 60,
        title: 'Defend or Fight the Trend',
        context: 'Repeated rallies fail and selling pressure dominates.',
        concept: {
          name: 'Mean Reversion',
          formula: 'E[X(t+1)] = μ + ρ(X(t) - μ)',
          lesson: 'Counter-trend trades require discipline and tight risk control.',
        },
        options: [
          {
            id: 'cut-losses',
            label: 'Cut losses and protect capital',
            rationale: 'Reduce exposure as trend remains down.',
            probability: 0.63,
            expectedReturn: -2,
            volatility: 7,
            impacts: {
              player: 'Smaller drawdowns',
              government: 'Lower tax receipts',
              economy: 'Risk aversion deepens',
              billionaires: 'Capital preservation',
              middleClass: 'Lower wipeout risk',
            },
            effects: { priceShock: -0.02, sentiment: -6, volatility: -0.07, score: 3 },
          },
          {
            id: 'defensive-rotation',
            label: 'Rotate to defensive assets',
            rationale: 'Seek stability while staying invested.',
            probability: 0.52,
            expectedReturn: 4,
            volatility: 11,
            impacts: {
              player: 'Moderate downside, steady returns',
              government: 'Stable tax base',
              economy: 'Capital shifts to stability',
              billionaires: 'Steady allocation',
              middleClass: 'Less volatility',
            },
            effects: { priceShock: 0.01, sentiment: 3, volatility: 0.03, score: 4 },
          },
          {
            id: 'average-down-bear',
            label: 'Average down aggressively',
            rationale: 'Bet on a sharp reversal despite weak momentum.',
            probability: 0.3,
            expectedReturn: 12,
            volatility: 20,
            impacts: {
              player: 'High upside, large drawdown risk',
              government: 'Speculation risk',
              economy: 'Potential instability',
              billionaires: 'Large upside potential',
              middleClass: 'Largest downside exposure',
            },
            effects: { priceShock: 0.05, sentiment: 9, volatility: 0.15, score: -3 },
          },
        ],
      },
    ],
  },
  {
    id: 'extreme-volatility',
    name: 'Extreme Volatility Gauntlet',
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
    decisions: [
      {
        id: 'volatility-hedge',
        day: 40,
        title: 'Volatility Spike',
        context: 'Daily swings exceed historical norms, forcing rapid risk adjustments.',
        concept: {
          name: 'Volatility Drag',
          formula: 'Geometric Return ≈ Arithmetic Return - (Variance/2)',
          lesson: 'High volatility can erode returns even with positive average moves.',
        },
        options: [
          {
            id: 'hedge-vol',
            label: 'Hedge and reduce position size',
            rationale: 'Lower variance and protect capital.',
            probability: 0.6,
            expectedReturn: 3,
            volatility: 12,
            impacts: {
              player: 'Lower drawdown risk',
              government: 'Stable markets',
              economy: 'Less shock transmission',
              billionaires: 'Capital preservation',
              middleClass: 'Reduced volatility exposure',
            },
            effects: { priceShock: -0.01, sentiment: -2, volatility: -0.1, score: 4 },
          },
          {
            id: 'tactical-trade',
            label: 'Tactical trading only',
            rationale: 'Exploit swings while avoiding long exposure.',
            probability: 0.48,
            expectedReturn: 8,
            volatility: 18,
            impacts: {
              player: 'Balanced risk with active management',
              government: 'Moderate market churn',
              economy: 'Capital moves quickly',
              billionaires: 'Mixed outcomes',
              middleClass: 'Requires timing skill',
            },
            effects: { priceShock: 0.03, sentiment: 5, volatility: 0.05, score: 3 },
          },
          {
            id: 'all-in-vol',
            label: 'Full risk-on',
            rationale: 'Maximize gains in extreme swings.',
            probability: 0.3,
            expectedReturn: 16,
            volatility: 28,
            impacts: {
              player: 'Huge upside, extreme downside',
              government: 'Systemic risk increases',
              economy: 'Amplified instability',
              billionaires: 'Outsized gains',
              middleClass: 'Highest wipeout risk',
            },
            effects: { priceShock: 0.07, sentiment: 12, volatility: 0.2, score: -4 },
          },
        ],
      },
    ],
  },
  {
    id: 'regulation-storm',
    name: 'Regulatory Storm',
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
    decisions: [
      {
        id: 'regulatory-response',
        day: 60,
        title: 'Policy Shock',
        context: 'New regulations increase compliance costs and change market incentives.',
        concept: {
          name: 'Regulatory Risk',
          formula: 'Expected Return = Base Return - Policy Cost',
          lesson: 'Rules can change the payoff structure overnight.',
        },
        options: [
          {
            id: 'comply-shift',
            label: 'Comply and shift exposure',
            rationale: 'Reduce exposure to regulated segments.',
            probability: 0.6,
            expectedReturn: 4,
            volatility: 10,
            impacts: {
              player: 'Lower risk, smaller upside',
              government: 'Higher compliance stability',
              economy: 'Capital shifts to safer sectors',
              billionaires: 'Stable returns',
              middleClass: 'More stability',
            },
            effects: { priceShock: -0.01, sentiment: -3, volatility: -0.07, score: 3 },
          },
          {
            id: 'lobby-adapt',
            label: 'Adapt and exploit new rules',
            rationale: 'Find new winners under regulation.',
            probability: 0.48,
            expectedReturn: 8,
            volatility: 14,
            impacts: {
              player: 'Balanced risk and upside',
              government: 'Policy objectives met',
              economy: 'Innovation shifts',
              billionaires: 'Selective winners',
              middleClass: 'Mixed effects',
            },
            effects: { priceShock: 0.02, sentiment: 4, volatility: 0.05, score: 4 },
          },
          {
            id: 'ignore-rules',
            label: 'Ignore policy risk',
            rationale: 'Bet on short-term gains despite rule changes.',
            probability: 0.3,
            expectedReturn: 14,
            volatility: 22,
            impacts: {
              player: 'High upside, heavy downside risk',
              government: 'Higher enforcement pressure',
              economy: 'Instability risk',
              billionaires: 'High upside if enforcement lags',
              middleClass: 'Largest downside risk',
            },
            effects: { priceShock: 0.06, sentiment: 10, volatility: 0.16, score: -3 },
          },
        ],
      },
    ],
  },
  {
    id: 'custom-chaos',
    name: 'Pure Chaos (All Events)',
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
    decisions: [
      {
        id: 'chaos-control',
        day: 30,
        title: 'Survival vs Aggression',
        context: 'Every shock is active. Capital preservation competes with massive upside.',
        concept: {
          name: 'Position Sizing',
          formula: 'Risk = Stake / Total Capital',
          lesson: 'Survival requires controlling position size in chaos.',
        },
        options: [
          {
            id: 'min-risk',
            label: 'Minimum risk exposure',
            rationale: 'Stay alive and avoid catastrophic swings.',
            probability: 0.6,
            expectedReturn: 3,
            volatility: 14,
            impacts: {
              player: 'Highest survival odds',
              government: 'Lower systemic stress',
              economy: 'Stability improves slightly',
              billionaires: 'Muted gains',
              middleClass: 'Less volatility exposure',
            },
            effects: { priceShock: -0.02, sentiment: -6, volatility: -0.12, score: 4 },
          },
          {
            id: 'balanced-chaos',
            label: 'Balanced exposure',
            rationale: 'Take selective risks with tight limits.',
            probability: 0.45,
            expectedReturn: 10,
            volatility: 22,
            impacts: {
              player: 'Moderate survival odds',
              government: 'Mixed market stress',
              economy: 'Volatile capital flows',
              billionaires: 'Mixed outcomes',
              middleClass: 'Significant volatility',
            },
            effects: { priceShock: 0.03, sentiment: 6, volatility: 0.08, score: 2 },
          },
          {
            id: 'max-risk',
            label: 'Maximum aggression',
            rationale: 'Chase extreme upside despite tail risk.',
            probability: 0.28,
            expectedReturn: 18,
            volatility: 30,
            impacts: {
              player: 'Huge upside, highest wipeout risk',
              government: 'Systemic risk spikes',
              economy: 'Instability intensifies',
              billionaires: 'Biggest upside capture',
              middleClass: 'Highest downside risk',
            },
            effects: { priceShock: 0.08, sentiment: 14, volatility: 0.22, score: -5 },
          },
        ],
      },
    ],
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
