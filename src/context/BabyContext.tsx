// src/context/BabyContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../hooks/useAuth";
import { type Baby, type BabyData, type CachedBabyData } from "./BabyTypes";
import { getTableNameForType } from "./BabyHelpers";
export type { BabyData } from "./BabyTypes";

type BabyContextType = {
  currentBabyId: string | null;
  currentBaby: Baby | null;
  babies: Baby[];
  babyData: BabyData | null;
  loading: boolean;
  setCurrentBabyId: (id: string | null) => Promise<void>;
  refreshBabies: (force?: boolean) => Promise<void>;
  refreshBabyData: (babyId?: string) => Promise<void>;
  addData: <T extends keyof BabyData>(type: T, data: BabyData[T][0]) => Promise<void>;
  updateData: <T extends keyof BabyData>(type: T, id: string, data: Partial<BabyData[T][0]>) => Promise<void>;
  deleteData: <T extends keyof BabyData>(type: T, id: string) => Promise<void>;
  clearCache: () => void;
  checkAndRefreshIfNeeded: () => Promise<void>;
};

const BabyContext = createContext<BabyContextType | undefined>(undefined);

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_KEY = 'babyDataCache';

export function BabyProvider({ children }: { children: React.ReactNode }) {
  const [currentBabyId, setCurrentBabyIdState] = useState<string | null>(null);
  const [currentBaby, setCurrentBaby] = useState<Baby | null>(null);
  const [babies, setBabies] = useState<Baby[]>([]);
  const [babyData, setBabyData] = useState<BabyData | null>(null);
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

  // Check and refresh data on app startup
  useEffect(() => {
    if (user?.id) {
      checkAndRefreshIfNeeded();
    }
  }, [user?.id]);

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
          
          // Load baby data from cache even if currentBabyId is not yet set
          let selectedId = currentBabyId || null;
          const hasCachedForCurrent = selectedId && parsed.babyData[selectedId];

          if (!hasCachedForCurrent) {
            const cachedIds = Object.keys(parsed.babyData || {});
            // Prefer a baby that has cached data; otherwise fall back to first baby
            selectedId = (cachedIds.length > 0 ? cachedIds[0] : (parsed.babies[0]?.id || null));
          }

          if (selectedId) {
            // Set current baby id locally without triggering a network fetch
            setCurrentBabyIdState(selectedId);
            localStorage.setItem("currentBabyId", selectedId);
            if (parsed.babyData[selectedId]) {
              setBabyData(parsed.babyData[selectedId]);
            }
          }
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
  const saveBabiesToCache = (babiesData: Baby[], babyDataToCache?: Record<string, BabyData>) => {
    if (!user?.id) return;
    
    const cacheData: CachedBabyData = {
      babies: babiesData,
      babyData: babyDataToCache || {},
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

  // Refresh baby data for a specific baby
  const refreshBabyData = async (babyId?: string) => {
    const targetBabyId = babyId || currentBabyId;
    if (!targetBabyId || !user?.id) return;

    try {
      console.log('Fetching baby data for:', targetBabyId);
      
      // Fetch all data types in parallel
      const [
        bottlesResult,
        mealsResult,
        breastResult,
        pumpsResult,
        diapersResult,
        bathsResult,
        weightsResult,
        measuresResult,
        activitiesResult,
        photosResult
      ] = await Promise.all([
        supabase.from('bottles').select('*').eq('baby_id', targetBabyId).order('date_time', { ascending: false }),
        supabase.from('meals').select('*').eq('baby_id', targetBabyId).order('date_time', { ascending: false }),
        supabase.from('breast_feeding').select('*').eq('baby_id', targetBabyId).order('date_time', { ascending: false }),
        supabase.from('pumps').select('*').eq('baby_id', targetBabyId).order('date_time', { ascending: false }),
        supabase.from('diapers').select('*').eq('baby_id', targetBabyId).order('date_time', { ascending: false }),
        supabase.from('baths').select('*').eq('baby_id', targetBabyId).order('date', { ascending: false }),
        supabase.from('weights').select('*').eq('baby_id', targetBabyId).order('date', { ascending: false }),
        supabase.from('measures').select('*').eq('baby_id', targetBabyId).order('date', { ascending: false }),
        supabase.from('activities').select('*').eq('baby_id', targetBabyId).order('date_time', { ascending: false }),
        supabase.from('photos').select('*').eq('baby_id', targetBabyId).order('created_at', { ascending: false })
      ]);

      const newBabyData: BabyData = {
        bottles: bottlesResult.data || [],
        meals: mealsResult.data || [],
        breast: breastResult.data || [],
        pumps: pumpsResult.data || [],
        diapers: diapersResult.data || [],
        baths: bathsResult.data || [],
        weights: weightsResult.data || [],
        measures: measuresResult.data || [],
        activities: activitiesResult.data || [],
        photos: photosResult.data || []
      };

      setBabyData(newBabyData);

      // Update cache
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsed: CachedBabyData = JSON.parse(cachedData);
        parsed.babyData[targetBabyId] = newBabyData;
        parsed.lastUpdated = Date.now();
        localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
      }

      console.log('Baby data refreshed successfully');
    } catch (error) {
      console.error('Error fetching baby data:', error);
    }
  };

  // Data management functions
  const addData = async <T extends keyof BabyData>(type: T, data: BabyData[T][0]) => {
    if (!currentBabyId || !user?.id) return;

    try {
      const tableName = getTableNameForType(type);
      const insertData = { ...data, baby_id: currentBabyId, user_id: user.id };
      
      const { data: result, error } = await supabase
        .from(tableName)
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error(`Error adding ${type}:`, error);
        throw error;
      }

      // Update context data
      setBabyData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [type]: [result, ...prev[type]] as BabyData[T]
        };
      });

      // Update cache
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsed: CachedBabyData = JSON.parse(cachedData);
        if (parsed.babyData[currentBabyId]) {
          parsed.babyData[currentBabyId][type] = [result, ...parsed.babyData[currentBabyId][type]] as BabyData[T];
          parsed.lastUpdated = Date.now();
          localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
        }
      }

      console.log(`${type} added successfully`);
    } catch (error) {
      console.error(`Error adding ${type}:`, error);
      throw error;
    }
  };

  const updateData = async <T extends keyof BabyData>(type: T, id: string, data: Partial<BabyData[T][0]>) => {
    if (!currentBabyId || !user?.id) return;

    try {
      const tableName = getTableNameForType(type);
      
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .eq('baby_id', currentBabyId)
        .select()
        .single();

      if (error) {
        console.error(`Error updating ${type}:`, error);
        throw error;
      }

      // Update context data
      setBabyData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [type]: prev[type].map(item => item.id === id ? result : item) as BabyData[T]
        };
      });

      // Update cache
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsed: CachedBabyData = JSON.parse(cachedData);
        if (parsed.babyData[currentBabyId]) {
          parsed.babyData[currentBabyId][type] = parsed.babyData[currentBabyId][type].map(item => 
            item.id === id ? result : item
          ) as BabyData[T];
          parsed.lastUpdated = Date.now();
          localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
        }
      }

      console.log(`${type} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${type}:`, error);
      throw error;
    }
  };

  const deleteData = async <T extends keyof BabyData>(type: T, id: string) => {
    if (!currentBabyId || !user?.id) return;

    try {
      const tableName = getTableNameForType(type);
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
        .eq('baby_id', currentBabyId);

      if (error) {
        console.error(`Error deleting ${type}:`, error);
        throw error;
      }

      // Update context data
      setBabyData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [type]: prev[type].filter(item => item.id !== id) as BabyData[T]
        };
      });

      // Update cache
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsed: CachedBabyData = JSON.parse(cachedData);
        if (parsed.babyData[currentBabyId]) {
          parsed.babyData[currentBabyId][type] = parsed.babyData[currentBabyId][type].filter(item => item.id !== id) as BabyData[T];
          parsed.lastUpdated = Date.now();
          localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
        }
      }

      console.log(`${type} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      throw error;
    }
  };

  // table name mapping imported from helpers

  // Check if data needs refresh and refresh if necessary
  const checkAndRefreshIfNeeded = async () => {
    if (!user?.id) {
      console.log('No user authenticated, skipping data refresh check');
      return;
    }

    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const parsed: CachedBabyData = JSON.parse(cachedData);
        const timeSinceLastUpdate = Date.now() - parsed.lastUpdated;
        const isExpired = timeSinceLastUpdate > CACHE_DURATION;
        const isSameUser = parsed.userId === user.id;
        
        console.log(`Data age: ${Math.round(timeSinceLastUpdate / 1000 / 60)} minutes, expired: ${isExpired}, same user: ${isSameUser}`);
        
        if (isExpired || !isSameUser) {
          console.log('Data is expired or user changed, refreshing...');
          await refreshBabies(true);
          if (currentBabyId) {
            await refreshBabyData(currentBabyId);
          }
        } else {
          console.log('Data is still fresh, no refresh needed');
        }
      } else {
        console.log('No cached data found, refreshing...');
        await refreshBabies(true);
        if (currentBabyId) {
          await refreshBabyData(currentBabyId);
        }
      }
    } catch (error) {
      console.error('Error checking data freshness:', error);
      // If there's an error, force refresh
      await refreshBabies(true);
      if (currentBabyId) {
        await refreshBabyData(currentBabyId);
      }
    }
  };

  // Save to localStorage when it changes
  const setCurrentBabyId = async (id: string | null) => {
    setCurrentBabyIdState(id);
    if (id) {
      localStorage.setItem("currentBabyId", id);
      // Load baby data when switching babies
      await refreshBabyData(id);
    } else {
      localStorage.removeItem("currentBabyId");
      setBabyData(null);
    }
  };

  return (
    <BabyContext.Provider value={{ 
      currentBabyId, 
      currentBaby, 
      babies, 
      babyData,
      loading, 
      setCurrentBabyId, 
      refreshBabies, 
      refreshBabyData,
      addData,
      updateData,
      deleteData,
      clearCache,
      checkAndRefreshIfNeeded
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
