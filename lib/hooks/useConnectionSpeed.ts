'use client';

import { useState, useEffect } from 'react';

interface NetworkInformation {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  downlink?: number;
  saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

const STORAGE_KEY = 'isLowBandwidth';
const LOW_BANDWIDTH_THRESHOLD = 0; // Mbps (disabled - set to 0 to make ineffective)

export function useConnectionSpeed(): boolean {
  const [isLowBandwidth, setIsLowBandwidth] = useState<boolean>(() => {
    // Check localStorage first for persistence
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const navigatorWithConnection = navigator as NavigatorWithConnection;
    
    // Get connection object (different browser prefixes)
    const connection = 
      navigatorWithConnection.connection ||
      navigatorWithConnection.mozConnection ||
      navigatorWithConnection.webkitConnection;

    const detectLowBandwidth = (): boolean => {
      // Low bandwidth mode is disabled (threshold set to 0)
      // Always return false regardless of connection speed
      return false;
      
      // Disabled checks (kept for reference):
      // if (!connection) {
      //   return false;
      // }
      // if (connection.effectiveType) {
      //   const slowTypes: Array<'slow-2g' | '2g' | '3g'> = ['slow-2g', '2g', '3g'];
      //   if (slowTypes.includes(connection.effectiveType as 'slow-2g' | '2g' | '3g')) {
      //     return true;
      //   }
      // }
      // if (connection.downlink !== undefined && connection.downlink < LOW_BANDWIDTH_THRESHOLD) {
      //   return true;
      // }
      // if (connection.saveData === true) {
      //   return true;
      // }
    };

    const updateLowBandwidth = () => {
      const isSlow = detectLowBandwidth();
      setIsLowBandwidth(isSlow);
      localStorage.setItem(STORAGE_KEY, String(isSlow));
    };

    // Initial detection
    updateLowBandwidth();

    // Listen for connection changes
    if (connection && 'addEventListener' in connection) {
      (connection as any).addEventListener('change', updateLowBandwidth);
    }

    return () => {
      if (connection && 'removeEventListener' in connection) {
        (connection as any).removeEventListener('change', updateLowBandwidth);
      }
    };
  }, []);

  return isLowBandwidth;
}

