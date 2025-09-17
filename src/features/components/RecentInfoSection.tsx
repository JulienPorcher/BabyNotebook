import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { getRelativeTimeString, getRelativeDateString } from '../../lib/timeUtils';

interface RecentData {
  lastMeal: { type: string; value: string; datetime: string } | null;
  lastDiaper: { value: string; datetime: string } | null;
  lastBath: { datetime: string } | null;
  lastPump: { datetime: string } | null;
}

interface RecentInfoSectionProps {
  currentBabyId: string | null;
  onDataRefresh?: () => void;
  onBabyChange?: () => void;
}

export default function RecentInfoSection({ currentBabyId, onDataRefresh, onBabyChange }: RecentInfoSectionProps) {
  const [recentData, setRecentData] = useState<RecentData>({
    lastMeal: null,
    lastDiaper: null,
    lastBath: null,
    lastPump: null
  });

  // Fetch recent data from view_home_last_news
  const fetchRecentData = async () => {
    if (!currentBabyId) return;

    try {
      const { data, error } = await supabase
        .from('view_home_last_news')
        .select('*')
        .eq('baby_id', currentBabyId)
        .single();

      if (error) {
        console.error('Error fetching recent data:', error);
        return;
      }

      // Debug: Log the data from the view
      console.log('Recent data from view:', data);
      console.log('Diaper data:', {
        last_diaper: data.last_diaper,
        last_diaper_at: data.last_diaper_at,
        diaper_type: data.diaper_type
      });

      // Determine the most recent meal type based on datetime
      const lastBottleAt = data.last_bottle_at;
      const lastMealAt = data.last_meal_at;
      const lastBreastfeedingAt = data.last_breastfeeding_at;
      
      let lastMeal = null;
      let mostRecentTime = null;
      
      // Compare timestamps to find the most recent meal
      if (lastBottleAt && (!mostRecentTime || lastBottleAt > mostRecentTime)) {
        mostRecentTime = lastBottleAt;
        lastMeal = {
          type: 'Biberon',
          value: `${data.bottle_quantity || 0}ml`,
          datetime: lastBottleAt
        };
      }
      
      if (lastMealAt && (!mostRecentTime || lastMealAt > mostRecentTime)) {
        mostRecentTime = lastMealAt;
        lastMeal = {
          type: 'Solide',
          value: `${data.meal_quantity || 0}g`,
          datetime: lastMealAt
        };
      }
      
      if (lastBreastfeedingAt && (!mostRecentTime || lastBreastfeedingAt > mostRecentTime)) {
        mostRecentTime = lastBreastfeedingAt;
        lastMeal = {
          type: 'Allaitement',
          value: `${data.breastfeeding_time || 0}min`,
          datetime: lastBreastfeedingAt
        };
      }

      // Process the data from the view
      const processedData = {
        lastMeal,
        lastDiaper: data.last_diaper_at ? {
          value: data.diaper_type,
          datetime: data.last_diaper_at
        } : null,
        lastBath: data.last_bath_at ? {
          datetime: data.last_bath_at || ''
        } : null,
        lastPump: data.last_pump_at ? {
          datetime: data.last_pump_at || ''
        } : null
      };

      setRecentData(processedData);
    } catch (error) {
      console.error('Error fetching recent data:', error);
    }
  };

  // Fetch recent data when baby changes or clear when no baby
  useEffect(() => {
    if (currentBabyId) {
      fetchRecentData();
    } else {
      // Clear data when no baby is selected
      setRecentData({
        lastMeal: null,
        lastDiaper: null,
        lastBath: null,
        lastPump: null
      });
    }
    
    // Notify parent that baby changed (for cache clearing)
    if (onBabyChange) {
      onBabyChange();
    }
  }, [currentBabyId, onBabyChange]);

  // Expose refresh function to parent
  useEffect(() => {
    if (onDataRefresh) {
      onDataRefresh();
    }
  }, [recentData]);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Dernières infos</h2>
      <div className="space-y-2">
        <InfoRow 
          title="Dernier repas"
          value={recentData.lastMeal ? `${recentData.lastMeal.type} : ${recentData.lastMeal.value} - ${getRelativeTimeString(recentData.lastMeal.datetime)}` : "Aucun repas récent"} 
        />
        <InfoRow 
          title="Dernière couche" 
          value={recentData.lastDiaper ? `${recentData.lastDiaper.value} - ${getRelativeTimeString(recentData.lastDiaper.datetime)}` : "Aucune couche récente"} 
        />
        <InfoRow 
          title="Dernier bain" 
          value={recentData.lastBath ? `${getRelativeDateString(recentData.lastBath.datetime)}` : "Aucun bain récent"} 
        />
        {recentData.lastPump && (
          <InfoRow 
            title="Dernière expression" 
            value={`${getRelativeTimeString(recentData.lastPump.datetime)}`} 
          />
        )}
      </div>
    </div>
  );
}

function InfoRow({ title, value }: { title: string; value: string }) {
  return (
    <div className="flex justify-between text-sm border-b pb-1">
      <span className="text-gray-600">{title}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
