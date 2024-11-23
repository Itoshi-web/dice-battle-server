import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices } from 'lucide-react';
import { cn } from '../lib/utils';

interface NumberPickerProps {
  maxNumber: number;
  onPick: (value: number) => void;
  disabled: boolean;
  firstMove: boolean;
}

const NumberPicker: React.FC<NumberPickerProps> = ({
  maxNumber,
  onPick,
  disabled,
  firstMove
}) => {
  const [rolling, setRolling] = useState(false);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);

  const roll = () => {
    if (rolling || disabled) return;

    setRolling(true);
    let rollCount = 0;
    const maxRolls = 10;
    const rollInterval = setInterval(() => {
      setCurrentNumber(Math.floor(Math.random() * maxNumber) + 1);
      rollCount++;

      if (rollCount >= maxRolls) {
        clearInterval(rollInterval);
        const finalValue = Math.floor(Math.random() * maxNumber) + 1;
        setCurrentNumber(finalValue);
        setRolling(false);
        onPick(finalValue);
        
        // Clear the number after a delay
        setTimeout(() => setCurrentNumber(null), 2000);
      }
    }, 100);
  };

  return (
    <div className="dice-container">
      <motion.button
        onClick={roll}
        disabled={rolling || disabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative w-16 h-16 rounded-full transition-all duration-300",
          rolling
            ? 'bg-primary/30 animate-pulse'
            : 'bg-primary/20 hover:bg-primary/30',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        <Dices className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white" />
        
        <AnimatePresence>
          {currentNumber !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-primary rounded-full"
            >
              <span className="text-2xl font-bold text-white">{currentNumber}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {firstMove && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/40 px-3 py-1 rounded-full text-sm"
        >
          <span className="text-accent">Roll a 1 to start!</span>
        </motion.div>
      )}
    </div>
  );
};

export default NumberPicker;