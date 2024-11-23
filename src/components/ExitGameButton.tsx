import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const ExitGameButton: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const { leaveRoom } = useGameStore();

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowConfirm(true)}
        className="fixed top-4 right-4 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-full backdrop-blur-sm transition-colors"
      >
        <LogOut className="w-6 h-6 text-red-400" />
      </motion.button>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowConfirm(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-sm w-full"
            >
              <h3 className="text-xl font-bold mb-4">Exit Game?</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to exit the game? You can rejoin later if the game is still in progress.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    leaveRoom();
                    setShowConfirm(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
                >
                  Exit Game
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExitGameButton;