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

type CachedBabyData = {
  babies: Baby[];
  lastUpdated: number;
  userId: string;
};

type BabyContextType = {
  currentBabyId: string | null;
  currentBaby: Baby | null;
  babies: Baby[];
  loading: boolean;
  setCurrentBabyId: (id: string | null) => void;
  refreshBabies: (force?: boolean) => Promise<void>;
  clearCache: () => void;
};

const BabyContext = createContext<BabyContextType | undefined>(undefined);

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_KEY = 'babyDataCache';

export function BabyProvider({ children }: { children: React.ReactNode }) {
  const [currentBabyId, setCurrentBabyIdState] = useState<string | null>(null);
  const [currentBaby, setCurrentBaby] = useState<Baby | null>(null);
  const [babies, setBabies] = useState<Baby[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load from localStorage on startup
  useEffect(() => {
    const saved = localStorage.getItem("currentBabyId");
    if (saved) {
      setCurrentBabyIdState(saved);
    }
  }, []);

  // Load babies when user is connected
  useEffect(() => {
    if (user) {
      loadBabiesFromCache();
    } else {
      setBabies([]);
      setCurrentBaby(null);
      clearCache();
    }
  }, [user]);

  // Update currentBaby when currentBabyId changes
  useEffect(() => {
    if (currentBabyId && babies.length > 0) {
      const baby = babies.find(b => b.id === currentBabyId);
      setCurrentBaby(baby || null);
    } else {
      setCurrentBaby(null);
      // Clear cache when no baby is selected
      if (!currentBabyId) {
        clearCache();
      }
    }
  }, [currentBabyId, babies]);

  // Load babies from cache
  const loadBabiesFromCache = async () => {
    if (!user?.id) return;

    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsed: CachedBabyData = JSON.parse(cachedData);
        
        // Check if cache is valid (same user and not expired)
        const isExpired = Date.now() - parsed.lastUpdated > CACHE_DURATION;
        const isSameUser = parsed.userId === user.id;
        
        if (!isExpired && isSameUser && parsed.babies.length > 0) {
          console.log('Loading babies from cache');
          setBabies(parsed.babies);
          return;
        }
      }
      
      // Cache is invalid or doesn't exist, fetch from server
      await refreshBabies(true);
    } catch (error) {
      console.error('Error loading from cache:', error);
      await refreshBabies(true);
    }
  };

  // Save babies to cache
  const saveBabiesToCache = (babiesData: Baby[]) => {
    if (!user?.id) return;
    
    const cacheData: CachedBabyData = {
      babies: babiesData,
      lastUpdated: Date.now(),
      userId: user.id
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  };

  // Clear cache
  const clearCache = () => {
    localStorage.removeItem(CACHE_KEY);
  };

  const refreshBabies = async (force: boolean = false) => {
    if (!user?.id) {
      console.log('No user authenticated, skipping baby fetch');
      return;
    }

    // If not forced, try to load from cache first
    if (!force) {
      await loadBabiesFromCache();
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching babies from server for user:', user.id);
      const { data, error } = await supabase
        .from('view_baby_list')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching babies:', error);
      } else {
        console.log('Fetched babies from server:', data);
        const babiesData = data || [];
        setBabies(babiesData);
        saveBabiesToCache(babiesData);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save to localStorage when it changes
  const setCurrentBabyId = (id: string | null) => {
    setCurrentBabyIdState(id);
    if (id) {
      localStorage.setItem("currentBabyId", id);
    } else {
      localStorage.removeItem("currentBabyId");
    }
  };

  return (
    <BabyContext.Provider value={{ 
      currentBabyId, 
      currentBaby, 
      babies, 
      loading, 
      setCurrentBabyId, 
      refreshBabies, 
      clearCache 
    }}>
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
