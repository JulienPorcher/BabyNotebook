import { type BabyData } from "./BabyTypes";

export const getTableNameForType = (type: keyof BabyData): string => {
  const tableMap: Record<keyof BabyData, string> = {
    bottles: 'bottles',
    meals: 'meals',
    breast: 'breast_feeding',
    pumps: 'pumps',
    diapers: 'diapers',
    baths: 'baths',
    weights: 'weights',
    measures: 'measures',
    observations: 'observations',
    photos: 'photos'
  };
  return tableMap[type];
};


