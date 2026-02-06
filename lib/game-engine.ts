// TIME IS THE MARKET: HIGH STAKES - Core Game Engine
// Deterministic probability engine with real financial mathematics

// Time units = 1 unit = 1 day of life
// Starting with 30 years = 10,950 days
export const DAYS_PER_YEAR = 365;
export const DAYS_PER_MONTH = 30;
export const STARTING_LIFETIME_YEARS = 30;
export const STARTING_TIME = STARTING_LIFETIME_YEARS * DAYS_PER_YEAR; // 10,950 days

export interface TimeDisplay {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

export function formatTimeUnits(days: number): TimeDisplay {
  const years = Math.floor(days / DAYS_PER_YEAR);
  const remainingAfterYears = days % DAYS_PER_YEAR;
  const months = Math.floor(remainingAfterYears / DAYS_PER_MONTH);
  const remainingDays = remainingAfterYears % DAYS_PER_MONTH;
  
  return {
    years,
    months,
    days: remainingDays,
    totalDays: days,
  };
}

export function formatTimeString(days: number): string {
  const { years, months, days: d } = formatTimeUnits(days);
  const parts: string[] = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}m`);
  if (d > 0 || parts.length === 0) parts.push(`${d}d`);
  return parts.join(' ');
}

export interface MarketInstrument {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  outcomes: Outcome[];
  minStake: number; // In days
  maxStakePercent: number;
  concept: string;
  unlockLevel: number;
}

export interface Outcome {
  label: string;
  probability: number;
  // Multiplier now represents RETURN on stake:
  // 1.0 = you get your stake back + same amount profit (2x total return)
  // 0.5 = you get your stake back + 50% profit
  // -1.0 = you lose entire stake
  // -0.5 = you lose 50% of stake
  multiplier: number;
  description: string;
}

export interface Lesson {
  id: string;
  conceptId: string;
  title: string;
  description: string;
  cost: number; // Days to unlock
  content: string;
  formula: string;
  example: string;
  unlocked: boolean;
}

export interface GameState {
  timeRemaining: number; // In days
  totalTimeEarned: number;
  totalTimeLost: number;
  totalTimeSpentOnLessons: number;
  currentRound: number;
  maxRounds: number;
  playerLevel: number;
  streak: number;
  volatilityMultiplier: number;
  riskExposure: number;
  conceptsLearned: string[];
  unlockedLessons: string[];
  decisions: Decision[];
  marketCondition: 'bull' | 'bear' | 'volatile' | 'stable';
  isGameOver: boolean;
  isVictory: boolean;
  score: number;
  bonusTime: number;
  marginDebt: number;
  isSimulationMode: boolean;
  simulationTimeRemaining: number; // Snapshot before simulation
  idleTime: number; // Track how long player is idle
  lastActivityTimestamp: number;
}

export interface Decision {
  round: number;
  instrumentId: string;
  stake: number;
  outcome: Outcome;
  netChange: number; // Can be negative (loss) or positive (profit)
  conceptApplied: string;
  wasOptimal: boolean;
  expectedValue: number;
  actualValue: number;
  timeAtStake: number; // How much was risked
}

// Seeded random for deterministic outcomes
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  setSeed(seed: number) {
    this.seed = seed;
  }
}

// Finance hints to show when idle
export const IDLE_HINTS = [
  { title: "Expected Value", hint: "Always calculate the average outcome before betting. EV = Sum of (Probability × Outcome)" },
  { title: "Position Sizing", hint: "Never risk more than you can afford to lose. The Kelly Criterion suggests optimal bet sizing." },
  { title: "Survivorship Bias", hint: "You only see the winners. For every success story, thousands failed. Don't be fooled." },
  { title: "Gambler's Fallacy", hint: "Past results don't affect future outcomes. Each trade is independent." },
  { title: "Risk Management", hint: "A 50% loss requires a 100% gain to recover. Protect your downside first." },
  { title: "Compound Returns", hint: "Small consistent gains beat large volatile swings. Time in market beats timing the market." },
  { title: "Leverage Warning", hint: "Leverage amplifies both gains AND losses. What can 10x your money can also zero it." },
  { title: "Volatility Drag", hint: "High volatility erodes returns over time, even with the same average return." },
  { title: "Mean Reversion", hint: "Extreme streaks tend to revert to the mean. Hot hands cool down." },
  { title: "Opportunity Cost", hint: "Every choice has a cost - what else could you have done with that time?" },
];

// Lessons that can be purchased with time
export const LESSONS: Lesson[] = [
  {
    id: 'ev-basics',
    conceptId: 'expectedValue',
    title: 'Expected Value Fundamentals',
    description: 'Learn to calculate if a bet is worth taking',
    cost: 180, // 6 months
    content: 'Expected Value (EV) is the average outcome if you repeated a decision infinite times. Positive EV = good bet over time.',
    formula: 'EV = Σ(Probability × Outcome)',
    example: 'Flip a coin: Win $2 (50%), Lose $1 (50%). EV = 0.5×$2 + 0.5×(-$1) = $0.50 per flip. Positive EV!',
    unlocked: false,
  },
  {
    id: 'kelly-criterion',
    conceptId: 'kellyFormula',
    title: 'Kelly Criterion: Optimal Bet Sizing',
    description: 'Never bet too much or too little',
    cost: 365, // 1 year
    content: 'The Kelly formula tells you exactly what percentage of your bankroll to bet to maximize long-term growth.',
    formula: 'f* = (bp - q) / b, where b=odds, p=win prob, q=lose prob',
    example: '60% win rate at 1:1 odds: f* = (1×0.6 - 0.4)/1 = 20% of bankroll',
    unlocked: false,
  },
  {
    id: 'risk-management',
    conceptId: 'drawdown',
    title: 'Drawdown Recovery Math',
    description: 'Understand why losses hurt more than gains help',
    cost: 270, // 9 months
    content: 'Recovery from losses requires increasingly larger gains. This is why protecting your capital is paramount.',
    formula: 'Required Gain = (1/(1-Loss%)) - 1',
    example: 'Lose 50% → Need 100% gain. Lose 80% → Need 400% gain. Lose 90% → Need 900% gain!',
    unlocked: false,
  },
  {
    id: 'variance',
    conceptId: 'volatilityClustering',
    title: 'Volatility and Variance',
    description: 'Why wild swings destroy returns',
    cost: 200, // ~7 months
    content: 'Two investments with same average return but different volatility have different outcomes. Higher variance = lower compound returns.',
    formula: 'Geometric Return ≈ Arithmetic Return - (Variance/2)',
    example: '+50% then -50% = -25% total (not 0%!). Volatility silently erodes wealth.',
    unlocked: false,
  },
  {
    id: 'leverage',
    conceptId: 'overLeveraging',
    title: 'The Danger of Leverage',
    description: 'Learn why borrowed money can destroy you',
    cost: 365, // 1 year  
    content: 'Leverage multiplies returns in both directions. A small adverse move can wipe you out entirely.',
    formula: 'Leveraged Return = Leverage × Underlying Return',
    example: '3x leverage: Market drops 34% → You lose 102% (wiped out + owe money)',
    unlocked: false,
  },
];

// Financial concepts for educational layer
export const FINANCIAL_CONCEPTS = {
  expectedValue: {
    name: 'Expected Value (EV)',
    formula: 'EV = Σ(probability × outcome)',
    description: 'The average result if you made this decision infinitely many times.',
    lesson: 'Always compare EV before deciding. Positive EV bets win over time.',
  },
  riskReward: {
    name: 'Risk-Reward Ratio',
    formula: 'R:R = Potential Gain / Potential Loss',
    description: 'Measures how much you stand to gain relative to what you might lose.',
    lesson: 'A 2:1 ratio means potential gain is twice the potential loss.',
  },
  overLeveraging: {
    name: 'Over-leveraging',
    formula: 'Leverage = Total Exposure / Capital',
    description: 'Borrowing to increase position size amplifies both gains AND losses.',
    lesson: 'High leverage turns small losses into catastrophic ones.',
  },
  diversification: {
    name: 'Diversification',
    formula: 'Portfolio Variance = Σ(weight² × variance)',
    description: 'Spreading risk across uncorrelated assets reduces overall volatility.',
    lesson: 'Never put all your time in one trade.',
  },
  drawdown: {
    name: 'Drawdown',
    formula: 'Drawdown = (Peak - Current) / Peak',
    description: 'The decline from your highest point. Recovery requires larger gains.',
    lesson: 'A 50% loss requires a 100% gain to recover.',
  },
  volatilityClustering: {
    name: 'Volatility Clustering',
    formula: 'σ(t) correlates with σ(t-1)',
    description: 'High volatility tends to follow high volatility.',
    lesson: 'After big moves, expect more big moves.',
  },
  gamblersFallacy: {
    name: "Gambler's Fallacy",
    formula: 'P(next) is independent of past',
    description: 'Believing past outcomes affect future independent events.',
    lesson: 'Each trade is independent. Past losses do not make wins more likely.',
  },
  kellyFormula: {
    name: 'Kelly Criterion',
    formula: 'f* = (bp - q) / b',
    description: 'Optimal bet sizing to maximize long-term growth.',
    lesson: 'Bet a fraction of your bankroll proportional to your edge.',
  },
  survivorshipBias: {
    name: 'Survivorship Bias',
    formula: 'Selection bias toward survivors',
    description: 'Only seeing winners creates false confidence.',
    lesson: 'For every winner, many losers are invisible.',
  },
  meanReversion: {
    name: 'Mean Reversion',
    formula: 'E[X(t+1)] = μ + ρ(X(t) - μ)',
    description: 'Extreme values tend to return toward the average.',
    lesson: 'Hot streaks end. Cold streaks end. Plan accordingly.',
  },
};

// Market instruments - stakes and returns in DAYS
export const MARKET_INSTRUMENTS: MarketInstrument[] = [
  // LOW RISK
  {
    id: 'savings',
    name: 'Time Savings',
    description: 'Guaranteed small return. Safe but slow.',
    riskLevel: 'low',
    minStake: 30, // 1 month minimum
    maxStakePercent: 0.5,
    concept: 'riskReward',
    unlockLevel: 1,
    outcomes: [
      { label: 'Interest Paid', probability: 1.0, multiplier: 0.05, description: '+5% guaranteed' },
    ],
  },
  {
    id: 'bond',
    name: 'Life Bond',
    description: 'Low risk with small chance of default.',
    riskLevel: 'low',
    minStake: 60, // 2 months
    maxStakePercent: 0.6,
    concept: 'expectedValue',
    unlockLevel: 1,
    outcomes: [
      { label: 'Coupon Paid', probability: 0.92, multiplier: 0.10, description: '+10% return' },
      { label: 'Default', probability: 0.08, multiplier: -0.5, description: '-50% loss' },
    ],
  },
  // MEDIUM RISK  
  {
    id: 'index',
    name: 'Market Index',
    description: 'Diversified market exposure. Moderate risk.',
    riskLevel: 'medium',
    minStake: 90, // 3 months
    maxStakePercent: 0.4,
    concept: 'diversification',
    unlockLevel: 1,
    outcomes: [
      { label: 'Bull Run', probability: 0.30, multiplier: 0.35, description: '+35% gain' },
      { label: 'Steady Growth', probability: 0.35, multiplier: 0.12, description: '+12% gain' },
      { label: 'Market Dip', probability: 0.25, multiplier: -0.20, description: '-20% loss' },
      { label: 'Crash', probability: 0.10, multiplier: -0.50, description: '-50% loss' },
    ],
  },
  {
    id: 'swing',
    name: 'Swing Trade',
    description: 'Short-term momentum play. Higher variance.',
    riskLevel: 'medium',
    minStake: 120, // 4 months
    maxStakePercent: 0.35,
    concept: 'volatilityClustering',
    unlockLevel: 2,
    outcomes: [
      { label: 'Perfect Entry', probability: 0.20, multiplier: 0.50, description: '+50% profit' },
      { label: 'Good Trade', probability: 0.30, multiplier: 0.20, description: '+20% profit' },
      { label: 'Breakeven', probability: 0.20, multiplier: 0, description: 'No change' },
      { label: 'Stopped Out', probability: 0.30, multiplier: -0.35, description: '-35% loss' },
    ],
  },
  // HIGH RISK
  {
    id: 'options',
    name: 'Time Options',
    description: 'Leveraged bets on market direction. High reward, high risk.',
    riskLevel: 'high',
    minStake: 180, // 6 months
    maxStakePercent: 0.3,
    concept: 'overLeveraging',
    unlockLevel: 3,
    outcomes: [
      { label: 'ITM Jackpot', probability: 0.12, multiplier: 2.0, description: '+200% return' },
      { label: 'ITM Profit', probability: 0.20, multiplier: 0.6, description: '+60% return' },
      { label: 'Expires Worthless', probability: 0.50, multiplier: -1.0, description: 'Total loss' },
      { label: 'Early Exit', probability: 0.18, multiplier: -0.6, description: '-60% loss' },
    ],
  },
  {
    id: 'futures',
    name: 'Life Futures',
    description: 'Leveraged contract on future time value.',
    riskLevel: 'high',
    minStake: 180, // 6 months
    maxStakePercent: 0.25,
    concept: 'kellyFormula',
    unlockLevel: 4,
    outcomes: [
      { label: 'Limit Up', probability: 0.15, multiplier: 1.0, description: '+100% gain' },
      { label: 'Profitable', probability: 0.25, multiplier: 0.40, description: '+40% gain' },
      { label: 'Margin Call', probability: 0.40, multiplier: -0.60, description: '-60% loss' },
      { label: 'Liquidated', probability: 0.20, multiplier: -1.0, description: 'Total loss' },
    ],
  },
  // EXTREME RISK
  {
    id: 'yolo',
    name: 'YOLO Trade',
    description: 'All or nothing. Maximum risk for maximum reward.',
    riskLevel: 'extreme',
    minStake: 365, // 1 year minimum!
    maxStakePercent: 1.0,
    concept: 'gamblersFallacy',
    unlockLevel: 5,
    outcomes: [
      { label: 'Moon Shot', probability: 0.08, multiplier: 4.0, description: '+400% return' },
      { label: 'Big Win', probability: 0.12, multiplier: 1.5, description: '+150% return' },
      { label: 'Small Win', probability: 0.15, multiplier: 0.3, description: '+30% return' },
      { label: 'Rekt', probability: 0.65, multiplier: -1.0, description: 'Total loss' },
    ],
  },
  {
    id: 'margin',
    name: 'Margin Leverage',
    description: 'Borrow future time to amplify current position.',
    riskLevel: 'extreme',
    minStake: 365, // 1 year minimum
    maxStakePercent: 0.5,
    concept: 'drawdown',
    unlockLevel: 6,
    outcomes: [
      { label: '10x Leverage Win', probability: 0.10, multiplier: 3.0, description: '+300% return' },
      { label: '5x Leverage Win', probability: 0.15, multiplier: 1.5, description: '+150% return' },
      { label: 'Breakeven', probability: 0.15, multiplier: 0, description: 'No change' },
      { label: 'Margin Call', probability: 0.35, multiplier: -0.85, description: '-85% loss' },
      { label: 'Full Liquidation', probability: 0.25, multiplier: -1.5, description: 'Lose stake + 50% debt' },
    ],
  },
];

// Calculate Expected Value
export function calculateEV(outcomes: Outcome[]): number {
  return outcomes.reduce((sum, o) => sum + o.probability * o.multiplier, 0);
}

// Calculate Variance
export function calculateVariance(outcomes: Outcome[]): number {
  const ev = calculateEV(outcomes);
  return outcomes.reduce((sum, o) => sum + o.probability * Math.pow(o.multiplier - ev, 2), 0);
}

// Calculate Standard Deviation (Volatility)
export function calculateVolatility(outcomes: Outcome[]): number {
  return Math.sqrt(calculateVariance(outcomes));
}

// Calculate worst-case outcome
export function getWorstCase(outcomes: Outcome[]): Outcome {
  return outcomes.reduce((worst, o) => (o.multiplier < worst.multiplier ? o : worst), outcomes[0]);
}

// Calculate best-case outcome
export function getBestCase(outcomes: Outcome[]): Outcome {
  return outcomes.reduce((best, o) => (o.multiplier > best.multiplier ? o : best), outcomes[0]);
}

// Resolve a trade based on seeded random
export function resolveTrade(instrument: MarketInstrument, random: SeededRandom): Outcome {
  return resolveOutcome(instrument.outcomes, random);
}

export function resolveOutcome(outcomes: Outcome[], random: SeededRandom): Outcome {
  const roll = random.next();
  let cumulative = 0;

  for (const outcome of outcomes) {
    cumulative += outcome.probability;
    if (roll < cumulative) {
      return outcome;
    }
  }

  return outcomes[outcomes.length - 1];
}

export function adjustOutcomesForStreak(
  outcomes: Outcome[],
  streak: number,
  riskLevel: MarketInstrument['riskLevel']
): Outcome[] {
  if (streak > -3 && streak < 3) return outcomes;

  const maxShift = riskLevel === 'low' ? 0.06 : riskLevel === 'medium' ? 0.05 : riskLevel === 'high' ? 0.03 : 0.02;
  const adjusted = outcomes.map((o) => ({ ...o }));
  const bestIndex = adjusted.reduce((best, o, i) => (o.multiplier > adjusted[best].multiplier ? i : best), 0);
  const worstIndex = adjusted.reduce((worst, o, i) => (o.multiplier < adjusted[worst].multiplier ? i : worst), 0);

  if (streak <= -3) {
    const shift = Math.min(maxShift, adjusted[worstIndex].probability * 0.5);
    adjusted[worstIndex].probability -= shift;
    adjusted[bestIndex].probability += shift;
  }

  if (streak >= 3) {
    const shift = Math.min(maxShift, adjusted[bestIndex].probability * 0.5);
    adjusted[bestIndex].probability -= shift;
    adjusted[worstIndex].probability += shift;
  }

  return adjusted;
}

// Calculate the net change from a trade
// stake = time put at risk
// multiplier = return on stake
// NET CHANGE can be negative (loss) or positive (profit)
export function calculateNetChange(stake: number, multiplier: number): number {
  // multiplier of 1.0 = +100% = double your money = profit of stake
  // multiplier of -1.0 = -100% = lose everything = loss of stake
  // multiplier of 0.5 = +50% = profit half of stake
  // multiplier of -0.5 = -50% = lose half of stake
  return Math.round(stake * multiplier);
}

// Calculate base income based on game state (income in days)
export function calculateIncome(state: GameState): number {
  const baseIncome = 90; // 3 months base income
  const stabilityBonus = Math.max(0, 30 - state.riskExposure * 60);
  const levelBonus = state.playerLevel * 15;
  const marketModifier = state.marketCondition === 'bull' ? 1.2 : state.marketCondition === 'bear' ? 0.8 : 1.0;

  return Math.round((baseIncome + stabilityBonus + levelBonus) * marketModifier);
}

// Update market condition based on player behavior
export function updateMarketCondition(state: GameState): 'bull' | 'bear' | 'volatile' | 'stable' {
  const recentDecisions = state.decisions.slice(-5);

  if (recentDecisions.length < 3) return 'stable';

  const avgRisk =
    recentDecisions.reduce((sum, d) => {
      const inst = MARKET_INSTRUMENTS.find((i) => i.id === d.instrumentId);
      return sum + (inst?.riskLevel === 'extreme' ? 4 : inst?.riskLevel === 'high' ? 3 : inst?.riskLevel === 'medium' ? 2 : 1);
    }, 0) / recentDecisions.length;

  const winRate = recentDecisions.filter((d) => d.netChange > 0).length / recentDecisions.length;

  if (avgRisk > 3 && winRate > 0.6) return 'volatile';
  if (avgRisk < 2 && winRate > 0.7) return 'bear';
  if (winRate < 0.3) return 'bull';
  return 'stable';
}

// Calculate score
export function calculateScore(state: GameState): number {
  const riskEfficiency = state.totalTimeEarned > 0 ? Math.min(2, state.timeRemaining / (state.totalTimeEarned * 0.5)) : 1;
  const conceptAccuracy = state.decisions.length > 0 ? state.decisions.filter((d) => d.wasOptimal).length / state.decisions.length : 1;
  const volatilityPenalty = state.volatilityMultiplier > 1.5 ? (state.volatilityMultiplier - 1.5) * 1000 : 0;
  const score = state.timeRemaining * riskEfficiency * conceptAccuracy - state.totalTimeLost * 0.5 - volatilityPenalty;

  return Math.max(0, Math.round(score));
}

// Determine if a decision was optimal
export function wasDecisionOptimal(instrument: MarketInstrument, stake: number, timeRemaining: number): boolean {
  const ev = calculateEV(instrument.outcomes);
  const volatility = calculateVolatility(instrument.outcomes);
  const riskRatio = stake / timeRemaining;

  const optimalBetRatio = ev > 0 ? Math.min(0.25, ev / volatility) : 0;

  if (ev > 0) {
    return riskRatio <= optimalBetRatio * 1.5;
  } else {
    return riskRatio <= 0.1;
  }
}

// Get concept explanation for a decision
export function getConceptExplanation(instrument: MarketInstrument, decision: Decision): {
  conceptUsed: string;
  conceptNeeded: string;
  explanation: string;
  improvement: string;
} {
  const concept = FINANCIAL_CONCEPTS[instrument.concept as keyof typeof FINANCIAL_CONCEPTS];
  const ev = calculateEV(instrument.outcomes);

  let conceptNeeded = instrument.concept;
  let explanation = '';
  let improvement = '';

  const riskRatio = decision.stake / (decision.stake + Math.abs(decision.netChange) || 1);

  if (decision.netChange < 0 && riskRatio > 0.3) {
    conceptNeeded = 'overLeveraging';
    explanation = `You risked ${formatTimeString(decision.stake)} on a single trade and lost ${formatTimeString(Math.abs(decision.netChange))}.`;
    improvement = 'Use Kelly Criterion: never risk more than your edge suggests.';
  } else if (ev < 0 && decision.stake > 180) {
    conceptNeeded = 'expectedValue';
    explanation = `This trade had negative EV of ${(ev * 100).toFixed(1)}%. You were statistically expected to lose.`;
    improvement = 'Always calculate EV before committing. Avoid negative EV trades.';
  } else if (decision.wasOptimal) {
    explanation = `Good decision! You correctly sized your position relative to the ${concept.name}.`;
    improvement = 'Continue applying this concept in future trades.';
  } else {
    explanation = `The ${concept.name} suggests a different approach for this situation.`;
    improvement = concept.lesson;
  }

  return {
    conceptUsed: concept.name,
    conceptNeeded: FINANCIAL_CONCEPTS[conceptNeeded as keyof typeof FINANCIAL_CONCEPTS].name,
    explanation,
    improvement,
  };
}

// Create initial game state
export function createInitialState(): GameState {
  return {
    timeRemaining: STARTING_TIME,
    totalTimeEarned: 0,
    totalTimeLost: 0,
    totalTimeSpentOnLessons: 0,
    currentRound: 0,
    maxRounds: 10,
    playerLevel: 1,
    streak: 0,
    volatilityMultiplier: 1.0,
    riskExposure: 0,
    conceptsLearned: [],
    unlockedLessons: [],
    decisions: [],
    marketCondition: 'stable',
    isGameOver: false,
    isVictory: false,
    score: 0,
    bonusTime: 0,
    marginDebt: 0,
    isSimulationMode: false,
    simulationTimeRemaining: STARTING_TIME,
    idleTime: 0,
    lastActivityTimestamp: Date.now(),
  };
}

// Get available instruments based on player level
export function getAvailableInstruments(level: number): MarketInstrument[] {
  return MARKET_INSTRUMENTS.filter((i) => i.unlockLevel <= level);
}

// Process hot streak detection
export function detectHotStreak(state: GameState): { isHot: boolean; isTrap: boolean; message: string } {
  if (state.streak >= 3) {
    return {
      isHot: true,
      isTrap: true,
      message: "HOT STREAK! But remember: past performance doesn't predict future results.",
    };
  }
  if (state.streak <= -3) {
    return {
      isHot: false,
      isTrap: true,
      message: "Cold streak... but don't chase losses. Each trade is independent.",
    };
  }
  return { isHot: false, isTrap: false, message: '' };
}

// Calculate margin interest
export function calculateMarginInterest(debt: number): number {
  return Math.round(debt * 0.15);
}

// Get player title
export function getPlayerTitle(state: GameState): string {
  const avgRisk =
    state.decisions.reduce((sum, d) => {
      const inst = MARKET_INSTRUMENTS.find((i) => i.id === d.instrumentId);
      return sum + (inst?.riskLevel === 'extreme' ? 4 : inst?.riskLevel === 'high' ? 3 : inst?.riskLevel === 'medium' ? 2 : 1);
    }, 0) / Math.max(1, state.decisions.length);

  const winRate = state.decisions.filter((d) => d.netChange > 0).length / Math.max(1, state.decisions.length);
  const optimalRate = state.decisions.filter((d) => d.wasOptimal).length / Math.max(1, state.decisions.length);

  if (optimalRate > 0.8 && winRate > 0.6) return 'The Quant';
  if (avgRisk > 3 && winRate > 0.5) return 'The Degen';
  if (avgRisk < 2 && state.timeRemaining > STARTING_TIME * 1.5) return 'The Saver';
  if (state.marginDebt > 0 && state.isVictory) return 'The Leveraged Survivor';
  if (avgRisk > 3.5) return 'The Gambler';
  if (optimalRate > 0.6) return 'The Student';
  return 'The Trader';
}

// Get a random idle hint
export function getRandomIdleHint(): typeof IDLE_HINTS[0] {
  return IDLE_HINTS[Math.floor(Math.random() * IDLE_HINTS.length)];
}
