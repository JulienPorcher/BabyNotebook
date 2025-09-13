// src/context/BabyContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";

type Baby = {
  id: string;
  name: string;
  birth_date: string;
  gender: string;
  user_id: string;
  role: string;
  nickname: string;
};

type BabyContextType = {
  currentBabyId: string | null;
  currentBaby: Baby | null;
  babies: Baby[];
  loading: boolean;
  setCurrentBabyId: (id: string | null) => void;
  refreshBabies: () => Promise<void>;
};

const BabyContext = createContext<BabyContextType | undefined>(undefined);

export function BabyProvider({ children }: { children: React.ReactNode }) {
  const [currentBabyId, setCurrentBabyIdState] = useState<string | null>(null);
  const [currentBaby, setCurrentBaby] = useState<Baby | null>(null);
  const [babies, setBabies] = useState<Baby[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Charger depuis localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem("currentBabyId");
    if (saved) {
      setCurrentBabyIdState(saved);
    }
  }, []);

  // Charger les bébés quand l'utilisateur est connecté
  useEffect(() => {
    if (user) {
      refreshBabies();
    } else {
      setBabies([]);
      setCurrentBaby(null);
    }
  }, [user]);

  // Mettre à jour currentBaby quand currentBabyId change
  useEffect(() => {
    if (currentBabyId && babies.length > 0) {
      const baby = babies.find(b => b.id === currentBabyId);
      setCurrentBaby(baby || null);
    } else {
      setCurrentBaby(null);
    }
  }, [currentBabyId, babies]);

  const refreshBabies = async () => {
    if (!user?.id) {
      console.log('No user authenticated, skipping baby fetch');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching babies for user:', user.id);
      const { data, error } = await supabase
        .from('view_baby_list')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching babies:', error);
      } else {
        console.log('Fetched babies:', data);
        setBabies(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <BabyContext.Provider value={{ currentBabyId, currentBaby, babies, loading, setCurrentBabyId, refreshBabies }}>
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
