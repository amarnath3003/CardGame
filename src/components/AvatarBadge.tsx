import { Bot } from 'lucide-react';
import { getAvatarPreset, AvatarPreset } from '../data/avatars';

interface AvatarBadgeProps {
  avatarIndex: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  highlight?: boolean;
  isAi?: boolean;
}

const SIZE_CLASSES: Record<NonNullable<AvatarBadgeProps['size']>, string> = {
  sm: 'h-8 w-8 landscape:h-8 landscape:w-8 text-xs md:h-10 md:w-10 md:text-sm',
  md: 'h-14 w-14 text-base',
  lg: 'h-20 w-20 text-xl',
};

const DankSketch: React.FC<{ type: AvatarPreset['type'] }> = ({ type }) => {
  return (
    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-md">
      {/* Base: Circle for head, semicircle for body */}
      <circle cx="50" cy="40" r="22" fill="white" stroke="black" strokeWidth="3" />
      <path d="M25 85 C 25 60, 75 60, 75 85" fill="white" stroke="black" strokeWidth="3" />

      {/* Specific Dank Elements */}
      {type === 'doomer' && (
        <>
          <path d="M30 30 Q 50 15, 70 30" fill="#1f2937" stroke="black" strokeWidth="2" /> {/* Beanie */}
          <path d="M40 45 Q 50 50, 60 45" stroke="black" fill="none" strokeWidth="2" /> {/* Sunken eyes */}
          <line x1="62" y1="52" x2="75" y2="52" stroke="white" strokeWidth="3" /> {/* Cigarette */}
        </>
      )}

      {type === 'thug' && (
        <>
          <rect x="32" y="35" width="36" height="10" fill="black" /> {/* Thug sunglasses */}
          <path d="M35 75 Q 50 85, 65 75" stroke="#fbbf24" fill="none" strokeWidth="4" /> {/* Chain */}
        </>
      )}

      {type === 'laser' && (
        <>
          <circle cx="42" cy="40" r="4" fill="#ff0000">
            <animate attributeName="r" values="3;6;3" dur="0.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="58" cy="40" r="4" fill="#ff0000">
            <animate attributeName="r" values="3;6;3" dur="0.5s" repeatCount="indefinite" />
          </circle>
          <path d="M42 40 L -20 0" stroke="#ff0000" strokeWidth="2" opacity="0.6" />
          <path d="M58 40 L 120 0" stroke="#ff0000" strokeWidth="2" opacity="0.6" />
        </>
      )}

      {type === 'sad' && (
        <>
          <path d="M40 38 Q 42 35, 45 38" stroke="black" fill="none" strokeWidth="2" /> {/* Sad eyes */}
          <path d="M55 38 Q 58 35, 60 38" stroke="black" fill="none" strokeWidth="2" />
          <path d="M40 50 Q 50 45, 60 50" stroke="black" fill="none" strokeWidth="2" /> {/* Frown */}
          <circle cx="43" cy="42" r="2" fill="#3b82f6" opacity="0.7" /> {/* Tear */}
        </>
      )}

      {type === 'smug' && (
        <>
          <path d="M38 38 Q 42 32, 46 38" stroke="black" fill="none" strokeWidth="3" /> {/* Smug eyes */}
          <path d="M54 38 Q 58 32, 62 38" stroke="black" fill="none" strokeWidth="3" />
          <path d="M40 48 Q 55 55, 65 48" stroke="black" fill="none" strokeWidth="3" /> {/* Smug grin */}
        </>
      )}

      {type === 'brainlet' && (
        <>
          <circle cx="50" cy="40" r="14" fill="white" stroke="black" strokeWidth="3" /> {/* Tiny head */}
          <path d="M48 50 Q 50 60, 52 50" stroke="#3b82f6" fill="#3b82f6" opacity="0.5" /> {/* Drool */}
        </>
      )}

      {type === 'galaxy' && (
        <>
          <circle cx="50" cy="35" r="28" fill="url(#galaxyGradient)" opacity="0.6" />
          <defs>
            <radialGradient id="galaxyGradient">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <path d="M40 35 L 50 20 L 60 35" stroke="white" fill="white" strokeWidth="2" /> {/* Glowing forehead */}
        </>
      )}

      {type === 'hype' && (
        <>
          <rect x="28" y="25" width="44" height="8" fill="#ef4444" /> {/* Red headband */}
          <text x="50" y="31" fontSize="5" fontWeight="bold" fill="white" textAnchor="middle">DANK</text>
          <path d="M35 38 L 45 42 L 55 38 L 65 42" stroke="black" fill="none" strokeWidth="2" /> {/* Hype glasses */}
        </>
      )}
    </svg>
  );
};

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  avatarIndex,
  label,
  size = 'md',
  highlight = false,
  isAi = false,
}) => {
  const preset = getAvatarPreset(avatarIndex);

  return (
    <div
      className={`relative flex items-center justify-center rounded-2xl border-[3px] ${
        highlight ? 'border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : 'border-white'
      } ${SIZE_CLASSES[size]} overflow-hidden`}
      style={{ backgroundImage: isAi ? 'linear-gradient(to bottom right, #475569, #1e293b)' : preset.gradient }}
      title={isAi ? 'AI Bot' : preset.name}
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 flex h-full w-full items-center justify-center">
        {isAi ? (
          <Bot className={`text-white drop-shadow-md ${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'}`} strokeWidth={2.5} />
        ) : (
          <div className="pt-1 w-full h-full flex items-center justify-center">
            <DankSketch type={preset.type} />
          </div>
        )}
      </div>
    </div>
  );
};

