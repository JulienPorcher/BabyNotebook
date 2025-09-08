// TimerContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";

type TimerContextType = {
  elapsed: number;
  isRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
};

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [elapsed, setElapsed] = useState<number>(() => {
    const saved = localStorage.getItem("elapsed");
    return saved ? Number(saved) : 0;
  });

  const [startTime, setStartTime] = useState<number | null>(() => {
    const saved = localStorage.getItem("startTime");
    return saved ? Number(saved) : null;
  });

  const isRunning = startTime !== null;

  // Sauvegarde persistante
  useEffect(() => {
    localStorage.setItem("elapsed", elapsed.toString());
  }, [elapsed]);

  useEffect(() => {
    if (startTime !== null) {
      localStorage.setItem("startTime", startTime.toString());
    } else {
      localStorage.removeItem("startTime");
    }
  }, [startTime]);

  // Mise à jour du chrono en live
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsed(prev => prev + (Date.now() - startTime));
        setStartTime(Date.now()); // on met à jour pour éviter un drift
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime]);

  const startTimer = () => {
    if (!isRunning) {
      setStartTime(Date.now());
    }
  };

  const pauseTimer = () => {
    if (startTime) {
      setElapsed(prev => prev + (Date.now() - startTime));
      setStartTime(null);
    }
  };

  const resetTimer = () => {
    setElapsed(0);
    setStartTime(null);
    localStorage.removeItem("elapsed");
    localStorage.removeItem("startTime");
  };

  return (
    <TimerContext.Provider
      value={{ elapsed, isRunning, startTimer, pauseTimer, resetTimer }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return context;
};
