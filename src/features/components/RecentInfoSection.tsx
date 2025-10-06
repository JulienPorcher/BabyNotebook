import { useState, useEffect } from 'react';
import { useBaby } from '../../context/BabyContext';
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
  const { babyData } = useBaby();
  const [recentData, setRecentData] = useState<RecentData>({
    lastMeal: null,
    lastDiaper: null,
    lastBath: null,
    lastPump: null
  });

  // Process recent data from context
  const processRecentData = () => {
    if (!babyData || !currentBabyId) {
      setRecentData({
        lastMeal: null,
        lastDiaper: null,
        lastBath: null,
        lastPump: null
      });
      return;
    }

    // Get the most recent entries from each category
    const bottles = babyData.bottles || [];
    const meals = babyData.meals || [];
    const breast = babyData.breast || [];
    const pumps = babyData.pumps || [];
    const diapers = babyData.diapers || [];
    const baths = babyData.baths || [];

    // Find most recent meal (bottle, solid meal, or breastfeeding)
    const mealCandidates = [];

    // Add bottles
    if (bottles.length > 0) {
      const lastBottle = bottles[0];
      mealCandidates.push({
        type: 'Biberon',
        value: `${lastBottle.quantity || 0}ml`,
        datetime: lastBottle.date_time
      });
    }

    // Add solid meals
    if (meals.length > 0) {
      const lastMealEntry = meals[0];
      mealCandidates.push({
        type: 'Solide',
        value: `${lastMealEntry.quantity || 0}g`,
        datetime: lastMealEntry.date_time
      });
    }

    // Add breastfeeding
    if (breast.length > 0) {
      const lastBreast = breast[0];
      mealCandidates.push({
        type: 'Allaitement',
        value: `${lastBreast.duration || 0}min`,
        datetime: lastBreast.date_time
      });
    }

    // Find the most recent meal
    const lastMeal = mealCandidates.length > 0 
      ? mealCandidates.reduce((latest, current) => 
          current.datetime > latest.datetime ? current : latest
        )
      : null;

    // Get most recent diaper
    const lastDiaper = diapers.length > 0 ? {
      value: diapers[0].type,
      datetime: diapers[0].date_time
    } : null;

    // Get most recent bath
    const lastBath = baths.length > 0 ? {
      datetime: baths[0].date
    } : null;

    // Get most recent pump
    const lastPump = pumps.length > 0 ? {
      datetime: pumps[0].date_time
    } : null;

    setRecentData({
      lastMeal,
      lastDiaper,
      lastBath,
      lastPump
    });
  };

  // Process recent data when baby data changes
  useEffect(() => {
    processRecentData();
  }, [babyData, currentBabyId]);

  // Notify parent that baby changed (for cache clearing)
  useEffect(() => {
    if (onBabyChange) {
      onBabyChange();
    }
  }, [currentBabyId, onBabyChange]);

  // Expose refresh function to parent - this should be called when data is successfully fetched
  useEffect(() => {
    if (onDataRefresh && currentBabyId) {
      onDataRefresh();
    }
  }, [currentBabyId, onDataRefresh]);

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
