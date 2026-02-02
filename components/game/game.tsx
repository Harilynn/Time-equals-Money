'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { GameProvider, useGame } from '@/lib/game-context';
import { TitleScreen } from './title-screen';
import { GameBoard } from './game-board';
import { GameOver } from './game-over';
import { SimulationMode } from './simulation-mode';

function GameContent() {
  const { state, startGame } = useGame();
  const [hasStarted, setHasStarted] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false);

  const handleStart = () => {
    startGame();
    setHasStarted(true);
  };

  const handleSimulationClick = () => {
    setIsSimulationMode(true);
  };

  const handleBackFromSimulation = () => {
    setIsSimulationMode(false);
  };

  if (isSimulationMode) {
    return <SimulationMode onBack={handleBackFromSimulation} />;
  }

  if (!hasStarted) {
    return <TitleScreen onStart={handleStart} onSimulation={handleSimulationClick} />;
  }

  if (state.isGameOver) {
    return <GameOver />;
  }

  return <GameBoard />;
}

export function Game() {
  return (
    <GameProvider>
      <AnimatePresence mode="wait">
        <GameContent />
      </AnimatePresence>
    </GameProvider>
  );
}
