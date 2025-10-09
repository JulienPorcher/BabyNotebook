import { useMemo } from 'react';
import { useBaby } from '../context/BabyContext';
import { type ActivityType } from '../lib/activityConfig';

interface ActivityUsage {
  activityType: ActivityType;
  usageCount: number;
}

export function useActivityUsage() {
  const { babyData } = useBaby();

  const activityUsage = useMemo(() => {
    if (!babyData) return [];

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const usageMap: Record<ActivityType, number> = {
      bottle: 0,
      meal: 0,
      breast: 0,
      pump: 0,
      diaper: 0,
      bath: 0,
      weight: 0,
      measure: 0,
      activity: 0,
      souvenir: 0,
      etapes: 0
    };

    // Count bottles (uses date_time)
    babyData.bottles.forEach(bottle => {
      const bottleDate = new Date(bottle.date_time);
      if (bottleDate >= thirtyDaysAgo) {
        usageMap.bottle++;
      }
    });

    // Count meals (uses date_time)
    babyData.meals.forEach(meal => {
      const mealDate = new Date(meal.date_time);
      if (mealDate >= thirtyDaysAgo) {
        usageMap.meal++;
      }
    });

    // Count breast feeding (uses date_time)
    babyData.breast.forEach(breast => {
      const breastDate = new Date(breast.date_time);
      if (breastDate >= thirtyDaysAgo) {
        usageMap.breast++;
      }
    });

    // Count pumps (uses date_time)
    babyData.pumps.forEach(pump => {
      const pumpDate = new Date(pump.date_time);
      if (pumpDate >= thirtyDaysAgo) {
        usageMap.pump++;
      }
    });

    // Count diapers (uses date_time)
    babyData.diapers.forEach(diaper => {
      const diaperDate = new Date(diaper.date_time);
      if (diaperDate >= thirtyDaysAgo) {
        usageMap.diaper++;
      }
    });

    // Count baths (uses date)
    babyData.baths.forEach(bath => {
      const bathDate = new Date(bath.date);
      if (bathDate >= thirtyDaysAgo) {
        usageMap.bath++;
      }
    });

    // Count weights (uses date)
    babyData.weights.forEach(weight => {
      const weightDate = new Date(weight.date);
      if (weightDate >= thirtyDaysAgo) {
        usageMap.weight++;
      }
    });

    // Count measures (uses date)
    babyData.measures.forEach(measure => {
      const measureDate = new Date(measure.date);
      if (measureDate >= thirtyDaysAgo) {
        usageMap.measure++;
      }
    });

    // Count activities (uses date_time)
    babyData.observations.forEach(activity => {
      const activityDate = new Date(activity.date_time);
      if (activityDate >= thirtyDaysAgo) {
        usageMap.activity++;
      }
    });

    // Count photos for souvenir and etapes (uses created_at)
    babyData.photos.forEach(photo => {
      const photoDate = new Date(photo.created_at);
      if (photoDate >= thirtyDaysAgo) {
        if (photo.category === 'memorie') {
          usageMap.souvenir++;
        } else if (photo.category === 'first step') {
          usageMap.etapes++;
        }
      }
    });

    // Convert to array and sort by usage count (descending)
    const usageArray: ActivityUsage[] = Object.entries(usageMap)
      .map(([activityType, usageCount]) => ({
        activityType: activityType as ActivityType,
        usageCount
      }))
      .sort((a, b) => b.usageCount - a.usageCount);

    return usageArray;
  }, [babyData]);

  return activityUsage;
}
