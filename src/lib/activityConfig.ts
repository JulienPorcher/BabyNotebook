import { Utensils, Heart, HeartPlus, Milk, Baby, Droplets, Scale, Ruler } from "lucide-react";

// Centralized configuration for all activity types
export const activityConfig = {
  // Meal-related activities
  bottle: {
    title: "Biberon",
    icon: Milk,
    table: "bottles",
    dateColumn: "date_time",
    unit: "ml",
    color: "bg-blue-50 border-blue-200",
    textColor: "text-blue-700",
    quantityType: null! as number,
    category: "meal" as const
  },
  meal: {
    title: "Solide",
    icon: Utensils,
    table: "meals",
    dateColumn: "date_time",
    unit: "g",
    color: "bg-green-50 border-green-200",
    textColor: "text-green-700",
    quantityType: null! as number,
    category: "meal" as const
  },
  breast: {
    title: "Allaitement",
    icon: Heart,
    table: "breast_feeding",
    dateColumn: "date_time",
    unit: "min",
    color: "bg-pink-50 border-pink-200",
    textColor: "text-pink-700",
    quantityType: null! as number,
    category: "meal" as const
  },
  pump: {
    title: "Expression",
    icon: HeartPlus,
    table: "pumps",
    dateColumn: "date_time",
    unit: "ml",
    color: "bg-purple-50 border-purple-200",
    textColor: "text-purple-700",
    quantityType: null! as number,
    category: "meal" as const
  },
  
  // Hygiene-related activities
  diaper: {
    title: "Couche",
    icon: Baby,
    table: "diapers",
    dateColumn: "date_time",
    unit: "",
    color: "bg-yellow-50 border-yellow-200",
    textColor: "text-yellow-700",
    quantityType: null! as string,
    category: "hygiene" as const
  },
  bath: {
    title: "Bain",
    icon: Droplets,
    table: "baths",
    dateColumn: "date",
    unit: "",
    color: "bg-cyan-50 border-cyan-200",
    textColor: "text-cyan-700",
    quantityType: null! as void,
    category: "hygiene" as const
  },
  
  // Health-related activities
  weight: {
    title: "Poids",
    icon: Scale,
    table: "weights",
    dateColumn: "date",
    unit: "kg",
    color: "bg-orange-50 border-orange-200",
    textColor: "text-orange-700",
    quantityType: null! as number,
    category: "health" as const
  },
  measure: {
    title: "Taille",
    icon: Ruler,
    table: "measures",
    dateColumn: "date",
    unit: "cm",
    color: "bg-indigo-50 border-indigo-200",
    textColor: "text-indigo-700",
    quantityType: null! as number,
    category: "health" as const
  },
  
  // Activities
  activity: {
    title: "Activité",
    icon: Baby,
    table: "activities",
    dateColumn: "date_time",
    unit: "",
    color: "bg-emerald-50 border-emerald-200",
    textColor: "text-emerald-700",
    quantityType: null! as string,
    category: "hygiene" as const
  }
} as const;

// Type definitions
export type ActivityType = keyof typeof activityConfig;
export type ActivityCategory = 'meal' | 'hygiene' | 'health';

// Helper functions
export const getTableName = (activityType: ActivityType): string => {
  return activityConfig[activityType].table;
};

export const getActivitiesByCategory = (category: ActivityCategory): ActivityType[] => {
  return Object.keys(activityConfig).filter(
    (key): key is ActivityType => 
      activityConfig[key as ActivityType].category === category
  );
};

export const getActivityConfig = (activityType: ActivityType) => {
  return activityConfig[activityType];
};

// Legacy compatibility - can be removed once all files are updated
export const logTypeConfig = activityConfig;
export const panelConfig = activityConfig;
