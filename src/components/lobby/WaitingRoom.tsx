import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Users, Copy, Check, AlertCircle } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import BackButton from '../BackButton';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

const WaitingRoom: React.FC = () => {
  // ... rest of the component remains the same ...
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-8">
      <BackButton />
      {/* ... rest of the JSX remains the same ... */}
    </div>
  );
};
export default WaitingRoom;