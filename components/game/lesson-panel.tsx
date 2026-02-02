'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/lib/game-context';
import { Lesson, formatTimeString, formatTimeUnits } from '@/lib/game-engine';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BookOpen, Lock, Unlock, AlertTriangle, Skull, GraduationCap, X, CheckCircle } from 'lucide-react';
import { soundManager } from '@/lib/sound-manager';

interface LessonPanelProps {
  onClose: () => void;
}

export function LessonPanel({ onClose }: LessonPanelProps) {
  const { state, lessons, unlockLesson } = useGame();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [confirmUnlock, setConfirmUnlock] = useState(false);

  const handleUnlock = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setConfirmUnlock(true);
  };

  const handleConfirmUnlock = () => {
    if (!selectedLesson) return;
    
    const success = unlockLesson(selectedLesson);
    if (success) {
      soundManager.playWin();
      setConfirmUnlock(false);
      setSelectedLesson(null);
    } else {
      soundManager.playLoss();
    }
  };

  const canAfford = (cost: number) => state.timeRemaining >= cost;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-2xl rounded-lg border-2 border-border bg-card p-6"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Finance Academy</h2>
            <p className="text-sm text-muted-foreground">
              Spend your lifetime to unlock crucial knowledge
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Warning */}
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-warning bg-warning/10 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div>
          <p className="text-sm font-medium text-warning">Knowledge Costs Time</p>
          <p className="text-xs text-muted-foreground">
            Unlocking lessons permanently reduces your remaining lifetime. 
            Choose wisely - this knowledge may help you survive longer trades.
          </p>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {lessons.map((lesson) => {
          const time = formatTimeUnits(lesson.cost);
          const affordable = canAfford(lesson.cost);
          
          return (
            <motion.div
              key={lesson.id}
              whileHover={{ scale: lesson.unlocked ? 1 : 1.02 }}
              className={cn(
                'relative rounded-lg border-2 p-4 transition-colors',
                lesson.unlocked 
                  ? 'border-success/50 bg-success/5' 
                  : affordable
                    ? 'border-primary/50 bg-card hover:border-primary'
                    : 'border-border bg-muted/20 opacity-60'
              )}
            >
              {/* Unlocked Badge */}
              {lesson.unlocked && (
                <div className="absolute -top-2 -right-2 rounded-full bg-success p-1">
                  <CheckCircle className="h-4 w-4 text-background" />
                </div>
              )}

              {/* Header */}
              <div className="mb-2 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {lesson.unlocked ? (
                    <Unlock className="h-4 w-4 text-success" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <h3 className="font-bold text-foreground">{lesson.title}</h3>
                </div>
              </div>

              {/* Description */}
              <p className="mb-3 text-sm text-muted-foreground">{lesson.description}</p>

              {/* Cost */}
              <div className={cn(
                'mb-3 flex items-center gap-2 rounded p-2',
                lesson.unlocked ? 'bg-success/10' : 'bg-danger/10'
              )}>
                <Skull className={cn('h-4 w-4', lesson.unlocked ? 'text-success' : 'text-danger')} />
                <span className={cn(
                  'text-sm font-bold',
                  lesson.unlocked ? 'text-success line-through' : 'text-danger'
                )}>
                  {time.years > 0 && `${time.years} year${time.years > 1 ? 's' : ''} `}
                  {time.months > 0 && `${time.months} month${time.months > 1 ? 's' : ''}`}
                  {time.years === 0 && time.months === 0 && `${time.days} days`}
                </span>
                {!lesson.unlocked && (
                  <span className="text-xs text-muted-foreground">of your life</span>
                )}
              </div>

              {/* Action or Content */}
              {lesson.unlocked ? (
                <div className="space-y-2 rounded bg-card/50 p-3">
                  <div className="text-xs font-medium text-muted-foreground">Formula:</div>
                  <code className="block font-mono text-sm text-primary">{lesson.formula}</code>
                  <div className="text-xs text-muted-foreground">{lesson.content}</div>
                  <div className="mt-2 rounded bg-muted/50 p-2">
                    <div className="text-xs font-medium text-muted-foreground">Example:</div>
                    <div className="text-xs text-foreground">{lesson.example}</div>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => handleUnlock(lesson)}
                  disabled={!affordable}
                  className="w-full gap-2"
                  variant={affordable ? 'default' : 'secondary'}
                >
                  <BookOpen className="h-4 w-4" />
                  {affordable ? 'Unlock Lesson' : 'Cannot Afford'}
                </Button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmUnlock && selectedLesson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setConfirmUnlock(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 max-w-md rounded-lg border-2 border-danger bg-card p-6"
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger/20">
                  <Skull className="h-6 w-6 text-danger" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Sacrifice Your Time?</h3>
                  <p className="text-sm text-muted-foreground">This cannot be undone</p>
                </div>
              </div>

              <div className="mb-4 rounded border border-danger/50 bg-danger/10 p-4">
                <p className="text-sm text-foreground">
                  You are about to spend{' '}
                  <span className="font-bold text-danger">{formatTimeString(selectedLesson.cost)}</span>
                  {' '}of your remaining lifetime to unlock:
                </p>
                <p className="mt-2 font-bold text-foreground">{selectedLesson.title}</p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setConfirmUnlock(false)}
                  className="flex-1 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmUnlock}
                  className="flex-1 bg-danger hover:bg-danger/90"
                >
                  Sacrifice Time
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
