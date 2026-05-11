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
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-8 text-center">
        <h1 className="text-5xl font-bold text-yellow-400 mb-6">
          {winnerName} WINS!
        </h1>
        <p className="text-2xl text-yellow-300 mb-8">
          Highest Card: <span className="text-white">{highestCard}</span>
        </p>
        <button
          onClick={onContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Continue to Next Round
        </button>
      </div>
    </div>
  );
};
