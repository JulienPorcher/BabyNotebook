import { Activity } from "lucide-react";
import type { FormPage } from "../forms/UnifiedForm";
import SquareButton from "../../components/ui/SquareButton";
import { useActivityUsage } from "../../hooks/useActivityUsage";

interface ActionButtonsSectionProps {
  onActionButtonClick: (page: FormPage) => void;
}

export default function ActionButtonsSection({ onActionButtonClick }: ActionButtonsSectionProps) {
  const activityUsage = useActivityUsage();
  
  // Get all activities ordered by usage
  const orderedActivities = activityUsage.map(item => item.activityType);
  
  // Add 'activity' if it's not already in the list (special case)
  const allActivities = orderedActivities.includes('activity') 
    ? orderedActivities 
    : [...orderedActivities, 'activity'];
  
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Ajouter</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {allActivities.map((activityType) => {
          // Special handling for 'activity' since it's not in activityConfig
          if (activityType === 'activity') {
            return (
              <SquareButton 
                key="activity"
                icon={<Activity className="w-6 h-6" />} 
                label="Activité" 
                onClick={() => onActionButtonClick("activity")}
                variant="compact"
                className="min-w-[80px]"
              />
            );
          }
          
          return (
            <SquareButton
              key={activityType}
              activityType={activityType as any}
              onClick={() => onActionButtonClick(activityType as FormPage)}
              variant="compact"
              className="min-w-[80px]"
            />
          );
        })}
      </div>
    </div>
  );
}
