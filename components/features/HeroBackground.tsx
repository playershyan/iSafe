'use client';

import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { useLowBandwidth } from '@/lib/contexts/LowBandwidthContext';

interface HeroBackgroundProps {
  className?: string;
}

export function HeroBackground({ className = '' }: HeroBackgroundProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { isLowBandwidth } = useLowBandwidth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hide decorative background in low-bandwidth mode
  if (isMounted && isLowBandwidth) {
    return null;
  }

  // Generate shield icons in a grid pattern
  const shields = [];
  const rows = 10;
  const cols = 15;
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Calculate opacity - fade out gradually from top to bottom
      // Start at 0.2 at top, fade to 0 at around 70% down
      const progress = row / rows;
      const opacity = Math.max(0, 0.2 * (1 - progress * 1.4));
      
      if (opacity > 0.01) {
        shields.push(
          <div
            key={`${row}-${col}`}
            className="absolute"
            style={{
              left: `${(col / cols) * 100}%`,
              top: `${(row / rows) * 100}%`,
              transform: 'translate(-50%, -50%) rotate(45deg)',
              opacity: opacity,
            }}
          >
            <Shield className="w-10 h-10 text-primary md:w-14 md:h-14" strokeWidth={1.5} />
          </div>
        );
      }
    }
  }

  return (
    <div
      className={`absolute inset-0 w-full overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {shields}
    </div>
  );
}

