import React from 'react';

interface LogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
  textColorClass?: string;
  logoColorClass?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  iconSize = 32,
  showText = true,
  textColorClass = 'text-slate-100',
  logoColorClass = 'text-indigo-500'
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* SVG Icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${logoColorClass} transition-transform duration-300 group-hover:scale-105`}
      >
        {/* Main Infinity Loop Path - Single Continuous Stroke */}
        <path
          d="M 46.5,43 L 50,35 C 57,18 88,18 88,35 C 88,52 57,52 50,35 C 43,18 12,18 12,35 C 12,52 43,52 50,35 L 53.5,27"
          stroke="currentColor"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Up-Right Arrow Head (at 53.5, 27) */}
        <path
          d="M 47.5,27.5 L 53.5,27 L 54.5,33.5"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Down-Left Arrow Head (at 46.5, 43) */}
        <path
          d="M 52.5,42.5 L 46.5,43 L 45.5,36.5"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Brand Name Text */}
      {showText && (
        <div className="flex flex-col text-left">
          <span className={`font-display font-extrabold text-lg tracking-wider leading-none ${textColorClass}`}>
            CV
          </span>
          <span className={`font-display font-medium text-[9px] tracking-[0.25em] uppercase mt-0.5 ${textColorClass} opacity-80`}>
            Dada
          </span>
        </div>
      )}
    </div>
  );
};
