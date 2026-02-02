'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Trophy, Medal, Star, TrendingUp, Clock, User } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  title: string;
  timeRemaining: number;
  winRate: number;
  timestamp: number;
}

// Sample leaderboard data (in a real app, this would come from an API)
const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'QuantMaster', score: 2847, title: 'The Quant', timeRemaining: 245, winRate: 0.78, timestamp: Date.now() - 3600000 },
  { id: '2', name: 'RiskTaker42', score: 2156, title: 'The Degen', timeRemaining: 180, winRate: 0.52, timestamp: Date.now() - 7200000 },
  { id: '3', name: 'SteadyEddie', score: 1923, title: 'The Saver', timeRemaining: 320, winRate: 0.85, timestamp: Date.now() - 10800000 },
  { id: '4', name: 'LeverageKing', score: 1756, title: 'The Leveraged Survivor', timeRemaining: 95, winRate: 0.45, timestamp: Date.now() - 14400000 },
  { id: '5', name: 'EVCalculator', score: 1644, title: 'The Student', timeRemaining: 210, winRate: 0.67, timestamp: Date.now() - 18000000 },
  { id: '6', name: 'MarketMind', score: 1589, title: 'The Trader', timeRemaining: 175, winRate: 0.58, timestamp: Date.now() - 21600000 },
  { id: '7', name: 'YOLOtrader', score: 1423, title: 'The Gambler', timeRemaining: 42, winRate: 0.35, timestamp: Date.now() - 25200000 },
  { id: '8', name: 'SafeHands', score: 1298, title: 'The Saver', timeRemaining: 280, winRate: 0.82, timestamp: Date.now() - 28800000 },
  { id: '9', name: 'SwingKing', score: 1187, title: 'The Trader', timeRemaining: 155, winRate: 0.61, timestamp: Date.now() - 32400000 },
  { id: '10', name: 'NewPlayer', score: 956, title: 'The Student', timeRemaining: 120, winRate: 0.50, timestamp: Date.now() - 36000000 },
];

interface LeaderboardProps {
  currentScore?: number;
  currentTitle?: string;
  className?: string;
}

export function Leaderboard({ currentScore, currentTitle, className }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(SAMPLE_LEADERBOARD);
  const [highlightedRank, setHighlightedRank] = useState<number | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEntries((prev) =>
        prev.map((entry) => ({
          ...entry,
          score: entry.score + Math.floor(Math.random() * 10) - 3,
        })).sort((a, b) => b.score - a.score)
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Calculate where current player would rank
  useEffect(() => {
    if (currentScore !== undefined) {
      const rank = entries.findIndex((e) => currentScore > e.score) + 1;
      setHighlightedRank(rank === 0 ? entries.length + 1 : rank);
    }
  }, [currentScore, entries]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-300" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="w-5 text-center font-mono text-muted-foreground">{rank}</span>;
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      {/* Header */}
      <div className="border-b border-border bg-muted/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Leaderboard</h3>
          </div>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Score = Time × Risk Efficiency × Concept Accuracy - Penalties
        </p>
      </div>

      {/* Current Player Position */}
      {currentScore !== undefined && highlightedRank && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-primary bg-primary/10 px-4 py-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <span className="font-medium text-foreground">Your Position</span>
                <div className="text-xs text-muted-foreground">{currentTitle}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-lg font-bold text-primary">#{highlightedRank}</div>
              <div className="font-mono text-sm text-muted-foreground">{currentScore.toLocaleString()} pts</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Entries */}
      <div className="max-h-[400px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'flex items-center justify-between border-b border-border px-4 py-3 transition-colors hover:bg-muted/30',
                index < 3 && 'bg-muted/20'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8">{getRankIcon(index + 1)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium text-foreground">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="rounded bg-muted px-1.5 py-0.5">{entry.title}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono text-lg font-bold text-foreground">{entry.score.toLocaleString()}</div>
                <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                  <span className={cn('flex items-center gap-1', entry.winRate >= 0.6 ? 'text-success' : 'text-danger')}>
                    <TrendingUp className="h-3 w-3" />
                    {(entry.winRate * 100).toFixed(0)}%
                  </span>
                  <span>{entry.timeRemaining} remaining</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
