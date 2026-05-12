import React, { memo } from 'react';

/**
 * CSS-only timer ring — replaces the JS-driven Framer Motion pathLength animation.
 * pathLength animations on SVG are expensive on mobile because they're JS-driven
 * and force layout recalculations. CSS stroke-dashoffset animations run on the
 * compositor thread and are 60fps even on low-end devices.
 */
export const TimerHighlight = memo(function TimerHighlight({
    compact = false,
}: {
    compact?: boolean;
}) {
    const offset = compact ? 11 : 8;
    const size = 100 + offset * 2;
    const rx = compact ? 47 : 33;
    // The perimeter of a rounded rect ≈ 2*(w+h) - (8-2π)*r
    // For compact (122x122, r=47): perimeter ≈ 2*(122+122) - (8-2π)*47 ≈ 488 - 77 = 411
    // For normal (116x116, r=33): perimeter ≈ 2*(116+116) - (8-2π)*33 ≈ 464 - 54 = 410
    const perimeter = compact ? 411 : 410;

    return (
        <>
            <style>{`
        @keyframes timer-dash {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: ${perimeter}; }
        }
        @keyframes timer-glow-pulse {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.85; }
        }
        @keyframes timer-color {
          0%   { stroke: #4ade80; }
          50%  { stroke: #eab308; }
          100% { stroke: #ef4444; }
        }
      `}</style>

            <svg
                className="absolute inset-0 h-full w-full pointer-events-none z-10"
                viewBox="0 0 100 100"
                style={{ overflow: 'visible' }}
            >
                {/* Outer border for visual separation */}
                <rect
                    x={-offset}
                    y={-offset}
                    width={size}
                    height={size}
                    rx={rx}
                    fill="none"
                    stroke="rgba(0,0,0,0.45)"
                    strokeWidth={compact ? 20.5 : 16.5}
                />

                {/* Subtle background track */}
                <rect
                    x={-offset}
                    y={-offset}
                    width={size}
                    height={size}
                    rx={rx}
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth={compact ? 8 : 6}
                />

                {/* Neon glow layer (blurred, CSS animated) */}
                <rect
                    x={-offset}
                    y={-offset}
                    width={size}
                    height={size}
                    rx={rx}
                    fill="none"
                    strokeWidth={compact ? 20 : 16}
                    strokeLinecap="round"
                    strokeDasharray={perimeter}
                    style={{
                        filter: `blur(${compact ? 8 : 6}px)`,
                        animation: `timer-dash 15s linear forwards, timer-glow-pulse 1.5s ease-in-out infinite, timer-color 15s linear forwards`,
                        willChange: 'stroke-dashoffset, opacity',
                    }}
                />

                {/* Crisp core line (CSS animated) */}
                <rect
                    x={-offset}
                    y={-offset}
                    width={size}
                    height={size}
                    rx={rx}
                    fill="none"
                    strokeWidth={compact ? 8 : 6}
                    strokeLinecap="round"
                    strokeDasharray={perimeter}
                    style={{
                        animation: `timer-dash 15s linear forwards, timer-color 15s linear forwards`,
                        willChange: 'stroke-dashoffset',
                    }}
                />
            </svg>
        </>
    );
});