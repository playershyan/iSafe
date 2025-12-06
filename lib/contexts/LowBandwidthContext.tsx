'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useConnectionSpeed } from '@/lib/hooks/useConnectionSpeed';

interface LowBandwidthContextType {
  isLowBandwidth: boolean;
}

const LowBandwidthContext = createContext<LowBandwidthContextType>({
  isLowBandwidth: false,
});

export function LowBandwidthProvider({ children }: { children: ReactNode }) {
  const isLowBandwidth = useConnectionSpeed();

  return (
    <LowBandwidthContext.Provider value={{ isLowBandwidth }}>
      {children}
    </LowBandwidthContext.Provider>
  );
}

export function useLowBandwidth(): LowBandwidthContextType {
  const context = useContext(LowBandwidthContext);
  if (context === undefined) {
    throw new Error('useLowBandwidth must be used within a LowBandwidthProvider');
  }
  return context;
}

