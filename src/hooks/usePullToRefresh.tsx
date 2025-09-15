import React, { useState, useEffect, useRef } from 'react';

interface UsePullToRefreshProps {
  onRefresh: () => void;
  isRefreshing: boolean;
}

interface UsePullToRefreshReturn {
  pullDistance: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  pullToRefreshIndicator: React.ReactNode;
  refreshingIndicator: React.ReactNode;
}

export function usePullToRefresh({ onRefresh, isRefreshing }: UsePullToRefreshProps): UsePullToRefreshReturn {
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  // Pull-to-refresh functionality
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        currentY.current = e.touches[0].clientY;
        const distance = Math.max(0, currentY.current - startY.current);
        
        if (distance > 0) {
          e.preventDefault();
          setPullDistance(Math.min(distance, 100));
        }
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > 50 && !isRefreshing) {
        onRefresh();
      }
      setPullDistance(0);
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, onRefresh]);

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
    pullToRefreshIndicator,
    refreshingIndicator
  };
}
