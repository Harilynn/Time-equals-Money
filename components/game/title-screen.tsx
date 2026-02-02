'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { STARTING_TIME, formatTimeString } from '@/lib/game-engine';
import { Play, BookOpen, Trophy, AlertTriangle, Skull, Heart, Clock, FlaskConical } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  onSimulation: () => void;
}

export function TitleScreen({ onStart, onSimulation }: TitleScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-danger/20 to-transparent"
            style={{
              top: `${Math.random() * 100}%`,
              left: 0,
              right: 0,
            }}
            animate={{
              opacity: [0, 1, 0],
              scaleX: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-3xl text-center">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <h1 className="mb-2 text-5xl font-bold tracking-tight text-foreground md:text-7xl">
            TIME IS THE
            <span className="block bg-gradient-to-r from-danger via-warning to-danger bg-clip-text text-transparent">MARKET</span>
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-danger/50" />
            <span className="flex items-center gap-2 rounded-full border border-danger bg-danger/10 px-4 py-1 text-sm font-bold text-danger">
              <Skull className="h-4 w-4" />
              HIGH STAKES
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-danger/50" />
          </div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-lg text-muted-foreground md:text-xl"
        >
          Trade with your remaining <span className="font-bold text-danger">lifetime</span>.
          <br />
          Win time. Lose time. <span className="font-semibold text-foreground">Die if you run out.</span>
        </motion.p>

        {/* Starting Condition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="mx-auto mt-8 max-w-md rounded-lg border-2 border-primary bg-primary/10 p-6"
        >
          <div className="flex items-center justify-center gap-3">
            <Heart className="h-8 w-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">You begin with</p>
              <p className="font-mono text-3xl font-bold text-primary">{formatTimeString(STARTING_TIME)}</p>
              <p className="text-xs text-muted-foreground">({STARTING_TIME.toLocaleString()} days of life)</p>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid gap-4 text-left md:grid-cols-3"
        >
          <div className="rounded-lg border border-danger/50 bg-card/50 p-4">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-danger/10">
              <Skull className="h-5 w-5 text-danger" />
            </div>
            <h3 className="font-semibold text-foreground">Real Risk</h3>
            <p className="text-sm text-muted-foreground">
              Every trade risks actual time from your life. Lose it all and you die.
            </p>
          </div>
          <div className="rounded-lg border border-primary/50 bg-card/50 p-4">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Learn Finance</h3>
            <p className="text-sm text-muted-foreground">
              Unlock lessons by spending time. Knowledge costs but may save your life.
            </p>
          </div>
          <div className="rounded-lg border border-warning/50 bg-card/50 p-4">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
              <FlaskConical className="h-5 w-5 text-warning" />
            </div>
            <h3 className="font-semibold text-foreground">Simulation Mode</h3>
            <p className="text-sm text-muted-foreground">
              Practice trades without risk. Master the concepts before betting your life.
            </p>
          </div>
        </motion.div>

        {/* Rules Preview */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-8 rounded-lg border border-border bg-card/50 p-6"
        >
          <h3 className="mb-4 font-bold text-foreground">The Rules of Life</h3>
          <div className="grid gap-3 text-left text-sm md:grid-cols-2">
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                1
              </span>
              <span className="text-muted-foreground">
                You have <span className="text-foreground">30 years</span> of life to start
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                2
              </span>
              <span className="text-muted-foreground">
                Earn income each round based on stability
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                3
              </span>
              <span className="text-muted-foreground">
                Choose trades with <span className="text-foreground">visible probabilities</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                4
              </span>
              <span className="text-muted-foreground">
                Stake your time - <span className="text-foreground">win or lose</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-danger/20 text-xs font-bold text-danger">
                !
              </span>
              <span className="text-muted-foreground">
                <span className="font-bold text-danger">TIME = 0 → YOU DIE</span>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/20 text-xs font-bold text-success">
                ?
              </span>
              <span className="text-muted-foreground">
                Survive 10 rounds to <span className="text-success">win</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* Death Warning */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 flex items-center justify-center gap-2 text-danger"
        >
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm font-medium">
            This game teaches financial concepts through intense stakes. Are you ready?
          </p>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, type: 'spring' }}
          className="mt-8 flex flex-col gap-4"
        >
          <Button onClick={onStart} size="lg" className="gap-2 px-12 py-6 text-lg bg-danger hover:bg-danger/90">
            <Play className="h-5 w-5" />
            Begin Your Life
          </Button>
          <Button onClick={onSimulation} size="lg" variant="outline" className="gap-2 px-12 py-6 text-lg border-warning text-warning hover:bg-warning/10">
            <FlaskConical className="h-5 w-5" />
            Try Simulation Mode
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Your {formatTimeString(STARTING_TIME)} starts now. Use it wisely.
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 text-center text-xs text-muted-foreground"
      >
        Educational game. Learn financial concepts through gameplay.
        <br />
        No real money or actual time is at risk.
      </motion.div>
    </div>
  );
}
