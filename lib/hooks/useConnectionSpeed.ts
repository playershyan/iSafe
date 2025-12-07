'use client';

import { useEffect } from 'react';

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
const LOW_BANDWIDTH_THRESHOLD = 0; // Mbps - Set to 0Kb (0 Mbps) to disable low connectivity mode

export function useConnectionSpeed(): boolean {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Clear localStorage to remove any previously stored low bandwidth flag
    // This ensures users with cached 'true' values get the mode disabled
    localStorage.setItem(STORAGE_KEY, 'false');
  }, []);

  // Always return false - low connectivity mode is disabled
  // Threshold set to 0Kb (0 Mbps) to disable the feature
  return false;
}

