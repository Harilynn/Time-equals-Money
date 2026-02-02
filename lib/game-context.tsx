'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import {
  GameState,
  Decision,
  MarketInstrument,
  Lesson,
  createInitialState,
  calculateIncome,
  updateMarketCondition,
  calculateScore,
  wasDecisionOptimal,
  resolveTrade,
  calculateEV,
  calculateNetChange,
  SeededRandom,
  calculateMarginInterest,
  getPlayerTitle,
  detectHotStreak,
  MARKET_INSTRUMENTS,
  LESSONS,
  STARTING_TIME,
} from './game-engine';

type GameAction =
  | { type: 'START_GAME' }
  | { type: 'START_SIMULATION' }
  | { type: 'END_SIMULATION' }
  | { type: 'EARN_INCOME' }
  | { type: 'MAKE_DECISION'; payload: { instrument: MarketInstrument; stake: number; seed: number; preCalculatedDecision: Decision } }
  | { type: 'NEXT_ROUND' }
  | { type: 'BORROW_MARGIN'; payload: { amount: number } }
  | { type: 'REPAY_MARGIN'; payload: { amount: number } }
  | { type: 'UNLOCK_LESSON'; payload: { lesson: Lesson } }
  | { type: 'UPDATE_IDLE_TIME'; payload: { idleTime: number } }
  | { type: 'RESET_ACTIVITY' }
  | { type: 'RESET_GAME' };

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  startGame: () => void;
  startSimulation: () => void;
  endSimulation: () => void;
  earnIncome: () => void;
  makeDecision: (instrument: MarketInstrument, stake: number) => Decision | null;
  nextRound: () => void;
  borrowMargin: (amount: number) => void;
  repayMargin: (amount: number) => void;
  unlockLesson: (lesson: Lesson) => boolean;
  updateIdleTime: (idleTime: number) => void;
  resetActivity: () => void;
  resetGame: () => void;
  hotStreakInfo: { isHot: boolean; isTrap: boolean; message: string };
  playerTitle: string;
  lessons: Lesson[];
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return { ...createInitialState(), currentRound: 1, lastActivityTimestamp: Date.now() };

    case 'START_SIMULATION':
      return {
        ...state,
        isSimulationMode: true,
        simulationTimeRemaining: state.timeRemaining,
      };

    case 'END_SIMULATION':
      return {
        ...state,
        isSimulationMode: false,
        timeRemaining: state.simulationTimeRemaining,
        // Reset decisions made during simulation
        decisions: state.decisions.filter((_, i) => i < state.decisions.length),
      };

    case 'EARN_INCOME': {
      const income = calculateIncome(state);
      return {
        ...state,
        timeRemaining: state.timeRemaining + income,
        totalTimeEarned: state.totalTimeEarned + income,
        bonusTime: income,
        lastActivityTimestamp: Date.now(),
        idleTime: 0,
      };
    }

    case 'MAKE_DECISION': {
      const { preCalculatedDecision } = action.payload;
      const decision = preCalculatedDecision;
      const netChange = decision.netChange;

      // Time is DEDUCTED first (stake is at risk), then outcome determines what you get back
      // netChange already accounts for the profit/loss relative to stake
      const newTimeRemaining = state.timeRemaining + netChange;
      const newStreak = netChange > 0 ? Math.max(1, state.streak + 1) : netChange < 0 ? Math.min(-1, state.streak - 1) : 0;

      const riskRatio = decision.stake / state.timeRemaining;
      const newRiskExposure = state.riskExposure * 0.7 + riskRatio * 0.3;
      const newVolatility = state.volatilityMultiplier + (Math.abs(newStreak) > 2 ? 0.1 : -0.05);

      // Margin interest
      const marginInterest = calculateMarginInterest(state.marginDebt);

      // Check game over
      const newTimeAfterInterest = Math.max(0, newTimeRemaining - marginInterest);
      const isGameOver = newTimeAfterInterest <= 0;

      return {
        ...state,
        timeRemaining: newTimeAfterInterest,
        totalTimeEarned: netChange > 0 ? state.totalTimeEarned + netChange : state.totalTimeEarned,
        totalTimeLost: netChange < 0 ? state.totalTimeLost + Math.abs(netChange) : state.totalTimeLost,
        decisions: [...state.decisions, decision],
        streak: newStreak,
        riskExposure: Math.max(0, Math.min(1, newRiskExposure)),
        volatilityMultiplier: Math.max(1, Math.min(3, newVolatility)),
        isGameOver,
        isVictory: false,
        conceptsLearned: decision.wasOptimal && !state.conceptsLearned.includes(decision.conceptApplied) 
          ? [...state.conceptsLearned, decision.conceptApplied] 
          : state.conceptsLearned,
        lastActivityTimestamp: Date.now(),
        idleTime: 0,
      };
    }

    case 'NEXT_ROUND': {
      const newRound = state.currentRound + 1;
      const isVictory = newRound > state.maxRounds && state.timeRemaining > 0;
      const newMarketCondition = updateMarketCondition(state);
      const newLevel = Math.min(6, Math.floor(newRound / 2) + 1);

      return {
        ...state,
        currentRound: newRound,
        playerLevel: newLevel,
        marketCondition: newMarketCondition,
        isGameOver: isVictory || state.timeRemaining <= 0,
        isVictory,
        score: calculateScore({ ...state, isVictory }),
        lastActivityTimestamp: Date.now(),
        idleTime: 0,
      };
    }

    case 'BORROW_MARGIN': {
      const { amount } = action.payload;
      return {
        ...state,
        timeRemaining: state.timeRemaining + amount,
        marginDebt: state.marginDebt + amount,
        lastActivityTimestamp: Date.now(),
        idleTime: 0,
      };
    }

    case 'REPAY_MARGIN': {
      const { amount } = action.payload;
      const repayAmount = Math.min(amount, state.marginDebt);
      return {
        ...state,
        timeRemaining: state.timeRemaining - repayAmount,
        marginDebt: state.marginDebt - repayAmount,
        lastActivityTimestamp: Date.now(),
        idleTime: 0,
      };
    }

    case 'UNLOCK_LESSON': {
      const { lesson } = action.payload;
      if (state.timeRemaining < lesson.cost) return state;
      if (state.unlockedLessons.includes(lesson.id)) return state;
      
      return {
        ...state,
        timeRemaining: state.timeRemaining - lesson.cost,
        totalTimeSpentOnLessons: state.totalTimeSpentOnLessons + lesson.cost,
        unlockedLessons: [...state.unlockedLessons, lesson.id],
        conceptsLearned: state.conceptsLearned.includes(lesson.conceptId)
          ? state.conceptsLearned
          : [...state.conceptsLearned, lesson.conceptId],
        lastActivityTimestamp: Date.now(),
        idleTime: 0,
      };
    }

    case 'UPDATE_IDLE_TIME': {
      return {
        ...state,
        idleTime: action.payload.idleTime,
      };
    }

    case 'RESET_ACTIVITY': {
      return {
        ...state,
        lastActivityTimestamp: Date.now(),
        idleTime: 0,
      };
    }

    case 'RESET_GAME':
      return createInitialState();

    default:
      return state;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, createInitialState());

  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  const startSimulation = useCallback(() => {
    dispatch({ type: 'START_SIMULATION' });
  }, []);

  const endSimulation = useCallback(() => {
    dispatch({ type: 'END_SIMULATION' });
  }, []);

  const earnIncome = useCallback(() => {
    dispatch({ type: 'EARN_INCOME' });
  }, []);

  const makeDecision = useCallback(
    (instrument: MarketInstrument, stake: number): Decision | null => {
      if (stake > state.timeRemaining || stake < instrument.minStake) {
        return null;
      }

      const maxStake = Math.floor(state.timeRemaining * instrument.maxStakePercent);
      if (stake > maxStake) {
        return null;
      }

      const seed = Date.now() + state.currentRound * 1000 + Math.floor(Math.random() * 1000);
      const random = new SeededRandom(seed);
      const outcome = resolveTrade(instrument, random);
      
      // Calculate net change: positive = profit, negative = loss
      const netChange = calculateNetChange(stake, outcome.multiplier);
      
      const ev = calculateEV(instrument.outcomes);
      const optimal = wasDecisionOptimal(instrument, stake, state.timeRemaining);

      const decision: Decision = {
        round: state.currentRound,
        instrumentId: instrument.id,
        stake,
        outcome,
        netChange,
        conceptApplied: instrument.concept,
        wasOptimal: optimal,
        expectedValue: Math.round(ev * stake),
        actualValue: netChange,
        timeAtStake: stake,
      };

      dispatch({ type: 'MAKE_DECISION', payload: { instrument, stake, seed, preCalculatedDecision: decision } });

      return decision;
    },
    [state.timeRemaining, state.currentRound]
  );

  const nextRound = useCallback(() => {
    dispatch({ type: 'NEXT_ROUND' });
  }, []);

  const borrowMargin = useCallback((amount: number) => {
    dispatch({ type: 'BORROW_MARGIN', payload: { amount } });
  }, []);

  const repayMargin = useCallback((amount: number) => {
    dispatch({ type: 'REPAY_MARGIN', payload: { amount } });
  }, []);

  const unlockLesson = useCallback((lesson: Lesson): boolean => {
    if (state.timeRemaining < lesson.cost) return false;
    if (state.unlockedLessons.includes(lesson.id)) return false;
    dispatch({ type: 'UNLOCK_LESSON', payload: { lesson } });
    return true;
  }, [state.timeRemaining, state.unlockedLessons]);

  const updateIdleTime = useCallback((idleTime: number) => {
    dispatch({ type: 'UPDATE_IDLE_TIME', payload: { idleTime } });
  }, []);

  const resetActivity = useCallback(() => {
    dispatch({ type: 'RESET_ACTIVITY' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const hotStreakInfo = useMemo(() => detectHotStreak(state), [state]);
  const playerTitle = useMemo(() => getPlayerTitle(state), [state]);

  // Get lessons with unlock status
  const lessons = useMemo(() => 
    LESSONS.map(lesson => ({
      ...lesson,
      unlocked: state.unlockedLessons.includes(lesson.id),
    })),
    [state.unlockedLessons]
  );

  const value = useMemo(
    () => ({
      state,
      dispatch,
      startGame,
      startSimulation,
      endSimulation,
      earnIncome,
      makeDecision,
      nextRound,
      borrowMargin,
      repayMargin,
      unlockLesson,
      updateIdleTime,
      resetActivity,
      resetGame,
      hotStreakInfo,
      playerTitle,
      lessons,
    }),
    [state, startGame, startSimulation, endSimulation, earnIncome, makeDecision, nextRound, borrowMargin, repayMargin, unlockLesson, updateIdleTime, resetActivity, resetGame, hotStreakInfo, playerTitle, lessons]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export { MARKET_INSTRUMENTS };
