// src/context/BabyContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

type BabyContextType = {
  currentBabyId: string | null;
  setCurrentBabyId: (id: string | null) => void;
};

const BabyContext = createContext<BabyContextType | undefined>(undefined);

export function BabyProvider({ children }: { children: React.ReactNode }) {
  const [currentBabyId, setCurrentBabyIdState] = useState<string | null>(null);

  // Charger depuis localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem("currentBabyId");
    if (saved) {
      setCurrentBabyIdState(saved);
    }
  }, []);

  // Sauvegarder dans localStorage quand ça change
  const setCurrentBabyId = (id: string | null) => {
    setCurrentBabyIdState(id);
    if (id) {
      localStorage.setItem("currentBabyId", id);
    } else {
      localStorage.removeItem("currentBabyId");
    }
  };
  return (
    <BabyContext.Provider value={{ currentBabyId, setCurrentBabyId }}>
      {children}
    </BabyContext.Provider>
  );
}

export function useBaby() {
  const context = useContext(BabyContext);
  if (!context) {
    throw new Error("useBaby must be used inside a BabyProvider");
  }
  return context;
}
