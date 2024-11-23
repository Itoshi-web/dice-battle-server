import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import PlayerColumn from './PlayerColumn';
import NumberPicker from './NumberPicker';
import ShootingModal from './ShootingModal';
import GameLog from './GameLog';
import Leaderboard from './Leaderboard';
import EmotePanel from './EmotePanel';
import GameHistory from './GameHistory';
import ExitGameButton from './ExitGameButton';
import InfoButton from './InfoButton';
import toast from 'react-hot-toast';
import ReactConfetti from 'react-confetti';

const GameArena: React.FC = () => {
  const { 
    currentRoom,
    username,
    performGameAction,
    gameHistory,
    leaveRoom
  } = useGameStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showShootingModal, setShowShootingModal] = React.useState(false);
  const [windowSize, setWindowSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      const currentPlayerElement = scrollRef.current.children[currentRoom?.gameState?.currentPlayer || 0];
      if (currentPlayerElement) {
        currentPlayerElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentRoom?.gameState?.currentPlayer]);

  if (!currentRoom || !currentRoom.gameState) return null;

  const currentPlayerIndex = currentRoom.gameState.currentPlayer;
  const currentPlayer = currentRoom.gameState.players[currentPlayerIndex];
  const isMyTurn = currentRoom.players[currentPlayerIndex].username === username;
  
  const handleNumberPick = (value: number) => {
    if (!isMyTurn) return;

    const targetCell = currentPlayer.cells[value - 1];
    if (targetCell.stage === 6 && targetCell.bullets > 0) {
      setShowShootingModal(true);
    } else {
      performGameAction('roll', { value });
    }
  };

  const handleShoot = (targetPlayer: number, targetCell: number) => {
    if (!isMyTurn) return;
    
    const diceValue = currentRoom.gameState.lastRoll;
    const shooterCell = currentPlayer.cells[diceValue - 1];

    if (shooterCell.stage === 6 && shooterCell.bullets > 0) {
      performGameAction('shoot', { 
        targetPlayer,
        targetCell
      });
      setShowShootingModal(false);
    }
  };

  useEffect(() => {
    if (isMyTurn) {
      toast.success("It's your turn!", {
        icon: '🎲',
        duration: 3000,
      });
    }
  }, [currentPlayerIndex, isMyTurn]);

  const winner = currentRoom.gameState.players.find(p => 
    !p.eliminated && currentRoom.gameState.players.filter(op => !op.eliminated).length === 1
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ExitGameButton />
      <InfoButton />
      
      <div className="container mx-auto px-4 py-16 md:py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-secondary/10 backdrop-blur-lg rounded-xl p-4 md:p-8 shadow-2xl"
        >
          {winner && (
            <ReactConfetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={500}
            />
          )}
          
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Dice Battle Arena</h1>
            <div className="flex items-center justify-center gap-4">
              <p className="text-primary">
                Current Turn: <span className="font-bold">
                  {currentRoom.players[currentPlayerIndex].username}
                  {isMyTurn ? " (You)" : ""}
                </span>
              </p>
            </div>
          </div>

          <Leaderboard players={currentRoom.gameState.players} />
          <GameLog gameLog={currentRoom.gameState.gameLog} />

          <div 
            ref={scrollRef}
            className="overflow-x-auto pb-4 mb-24 snap-x snap-mandatory custom-scrollbar"
          >
            <div className="flex gap-4 min-w-max px-4">
              {currentRoom.gameState.players.map((player, index) => (
                <div key={player.id} className="player-column">
                  <PlayerColumn
                    player={player}
                    isCurrentPlayer={currentPlayerIndex === index}
                    isMyTurn={isMyTurn}
                    numCells={currentRoom.players.length}
                  />
                </div>
              ))}
            </div>
          </div>

          {!winner && isMyTurn && (
            <NumberPicker
              maxNumber={currentRoom.players.length}
              onPick={handleNumberPick}
              disabled={showShootingModal || currentPlayer.eliminated}
              firstMove={currentPlayer.firstMove}
            />
          )}

          <AnimatePresence>
            {showShootingModal && (
              <ShootingModal
                players={currentRoom.gameState.players}
                currentPlayer={currentPlayerIndex}
                onShoot={handleShoot}
                onClose={() => setShowShootingModal(false)}
              />
            )}
          </AnimatePresence>

          <EmotePanel />

          {gameHistory && (
            <GameHistory 
              history={gameHistory} 
              onClose={() => leaveRoom()} 
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GameArena;