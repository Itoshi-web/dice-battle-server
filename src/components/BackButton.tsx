import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const BackButton: React.FC = () => {
  const { navigateBack } = useGameStore();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={navigateBack}
      className="fixed top-4 left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
    >
      <ArrowLeft className="w-6 h-6 text-white" />
    </motion.button>
  );
};

export default BackButton;