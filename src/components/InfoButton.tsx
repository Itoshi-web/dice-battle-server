import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';

const InfoButton: React.FC = () => {
  const [showRules, setShowRules] = useState(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowRules(true)}
        className="fixed top-4 right-4 p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-full backdrop-blur-sm transition-colors"
      >
        <Info className="w-6 h-6 text-blue-400" />
      </motion.button>

      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowRules(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold">How to Play</h3>
                <button
                  onClick={() => setShowRules(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 text-gray-300">
                <section>
                  <h4 className="text-xl font-semibold mb-2 text-white">Objective</h4>
                  <p>Be the last player standing by strategically building your defenses and attacking other players.</p>
                </section>

                <section>
                  <h4 className="text-xl font-semibold mb-2 text-white">Game Flow</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Players take turns rolling a dice</li>
                    <li>The number rolled corresponds to a cell position (1-6)</li>
                    <li>On your first turn, you must roll a 1 to start</li>
                    <li>Each cell can be upgraded through 6 stages</li>
                  </ol>
                </section>

                <section>
                  <h4 className="text-xl font-semibold mb-2 text-white">Cell Stages</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Stage 1: Basic defense (Head)</li>
                    <li>Stage 2: Adds body</li>
                    <li>Stage 3: Adds legs</li>
                    <li>Stage 4: Adds arms</li>
                    <li>Stage 5: Adds weapon</li>
                    <li>Stage 6: Fully armed with 5 bullets</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-xl font-semibold mb-2 text-white">Combat</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>When a cell reaches stage 6, it gets 5 bullets</li>
                    <li>You can shoot other players' cells of the same number</li>
                    <li>A successful shot destroys the target cell completely</li>
                    <li>Players are eliminated when all their cells are destroyed</li>
                  </ul>
                </section>

                <section>
                  <h4 className="text-xl font-semibold mb-2 text-white">Tips</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Focus on upgrading cells to stage 6 for weapons</li>
                    <li>Keep track of other players' bullets</li>
                    <li>Try to eliminate players with the most upgraded cells</li>
                    <li>Use emotes to interact with other players</li>
                  </ul>
                </section>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InfoButton;