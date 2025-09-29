import { Activity } from "lucide-react";
import type { JSX } from "react";
import type { FormPage } from "../forms/UnifiedForm";
import { getActivityConfig, type ActivityType } from "../../lib/activityConfig";

interface ActionButtonsSectionProps {
  onActionButtonClick: (page: FormPage) => void;
}

export default function ActionButtonsSection({ onActionButtonClick }: ActionButtonsSectionProps) {
  // Define the activities to show in the action buttons
  const activities: ActivityType[] = ['bottle', 'meal', 'breast', 'pump', 'diaper', 'bath', 'weight', 'measure'];
  
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Ajouter</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
        {activities.map((activityType) => {
          const config = getActivityConfig(activityType);
          const IconComponent = config.icon;
          return (
            <ActionButton
              key={activityType}
              icon={<IconComponent className="w-6 h-6" />}
              label={config.title}
              onClick={() => onActionButtonClick(activityType as FormPage)}
            />
          );
        })}
        {/* Special case for activity which is not in our config */}
        <ActionButton icon={<Activity className="w-6 h-6" />} label="Activité" onClick={() => onActionButtonClick("activity")} />
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: JSX.Element; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center min-w-[80px] bg-gray-100 rounded-xl p-3 hover:bg-gray-200"
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}
