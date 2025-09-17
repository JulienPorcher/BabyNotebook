import { useState, useRef } from 'react';
import { useDrag } from '@use-gesture/react';

interface UsePullToRefreshProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

interface UsePullToRefreshReturn {
  pullDistance: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  bind: () => any;
  pullToRefreshIndicator: React.ReactNode;
  refreshingIndicator: React.ReactNode;
}

export function usePullToRefresh({ onRefresh, isRefreshing }: UsePullToRefreshProps): UsePullToRefreshReturn {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pullDistance, setPullDistance] = useState(0);

  const bind = useDrag(
    ({ down, movement: [, my], first, last }) => {
      // Only allow pull when at top of scroll
      if (containerRef.current?.scrollTop !== 0) return;
      
      if (first) {
        setPullDistance(0);
      }
      
      if (down && my > 0) {
        // Pulling down
        const distance = Math.min(my, 100);
        setPullDistance(distance);
      } else if (last) {
        // Released
        if (pullDistance > 50 && !isRefreshing) {
          onRefresh();
        }
        setPullDistance(0);
      }
    },
    {
      axis: 'y',
      filterTaps: true,
      bounds: { top: 0 }
    }
  );

  const pullToRefreshIndicator = pullDistance > 0 && (
    <div className="flex justify-center items-center py-2">
      <div className={`w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin ${pullDistance > 50 ? 'opacity-100' : 'opacity-50'}`} />
      <span className="ml-2 text-sm text-gray-600">
        {pullDistance > 50 ? 'Relâchez pour actualiser' : 'Tirez vers le bas pour actualiser'}
      </span>
    </div>
  );

  const refreshingIndicator = isRefreshing && (
    <div className="flex justify-center items-center py-2">
      <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      <span className="ml-2 text-sm text-gray-600">Actualisation...</span>
    </div>
  );

  return {
    pullDistance,
    containerRef,
    bind,
    pullToRefreshIndicator,
    refreshingIndicator
  };
}
