import React from 'react';

interface RoundOverModalProps {
  winnerName: string;
  highestCard: string;
  onContinue: () => void;
}

export const RoundOverModal: React.FC<RoundOverModalProps> = ({
  winnerName,
  highestCard,
  onContinue,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-blue-500 to-purple-600 rounded-3xl p-10 text-center border-4 border-white shadow-[0_10px_25px_rgba(0,0,0,0.5)] transform animate-in zoom-in-95 duration-300">
        
        {/* Confetti or decorative stars can go here */}
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-6xl">
          🏆
        </div>

        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mt-4 mb-4">
          {winnerName} WINS!
        </h1>
        
        <div className="bg-black/30 rounded-xl p-4 mb-8 border border-white/20">
          <p className="text-xl text-blue-100 font-bold">
            Winning Card: <span className="text-3xl text-white ml-2 drop-shadow-md">{highestCard}</span>
          </p>
        </div>

        <button
          onClick={onContinue}
          className="bg-gradient-to-b from-green-400 to-green-600 text-white font-black text-xl py-4 px-10 rounded-full shadow-[0_6px_0_#1a73e8] border-2 border-white active:shadow-[0_0px_0_#1a73e8] active:translate-y-[6px] transition-all hover:scale-105"
        >
          NEXT ROUND
        </button>
      </div>
    </div>
  );
};
