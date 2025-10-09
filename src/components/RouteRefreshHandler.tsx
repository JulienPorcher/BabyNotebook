import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useBaby } from '../context/BabyContext';

export default function RouteRefreshHandler() {
  const location = useLocation();
  const { checkAndRefreshIfNeeded } = useBaby();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Only check and refresh if the path actually changed
    if (lastPathRef.current !== location.pathname) {
      lastPathRef.current = location.pathname;
      console.log('Route changed to:', location.pathname, '- checking data freshness...');
      checkAndRefreshIfNeeded();
    }
  }, [location.pathname, checkAndRefreshIfNeeded]);

  return null; // This component doesn't render anything
}
