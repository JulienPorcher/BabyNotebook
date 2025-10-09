import { type JSX, type ComponentType } from "react";
import { getActivityConfig, type ActivityType } from "../../lib/activityConfig";

interface SquareButtonProps {
  // Activity-based props
  activityType?: ActivityType;
  
  // Custom props for non-activity buttons
  icon?: JSX.Element;
  label?: string;
  
  // Styling variants
  variant?: 'default' | 'colored' | 'compact';
  color?: 'purple' | 'green' | 'blue' | 'yellow' | 'red';
  
  // Layout
  layout?: 'vertical' | 'horizontal';
  
  // Behavior
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export default function SquareButton({
  activityType,
  icon,
  label,
  variant = 'default',
  color = 'purple',
  layout = 'vertical',
  onClick,
  disabled = false,
  className = ''
}: SquareButtonProps) {
  // Get config from activity type if provided
  const config = activityType ? getActivityConfig(activityType) : null;
  const IconComponent = config?.icon as ComponentType<{ className?: string }> | undefined;
  const buttonLabel = config?.title || label;
  
  // Base classes
  const baseClasses = "flex items-center justify-center rounded-xl transition-colors";
  
  // Layout classes
  const layoutClasses = layout === 'vertical' 
    ? "flex-col" 
    : "gap-2";
  
  // Variant classes
  const variantClasses = {
    default: "bg-gray-100 hover:bg-gray-200 text-gray-800",
    colored: `bg-${color}-500 hover:bg-${color}-600 text-white`,
    compact: "bg-gray-100 hover:bg-gray-200 text-gray-800"
  };
  
  // Size classes
  const sizeClasses = {
    default: "p-4",
    colored: "px-3 py-2", 
    compact: "p-3"
  };
  
  // Icon size classes
  const iconSizeClasses = {
    default: "w-6 h-6",
    colored: "w-4 h-4",
    compact: "w-5 h-5"
  };
  
  // Text size classes
  const textSizeClasses = {
    default: "text-xs mt-1",
    colored: "text-sm",
    compact: "text-xs mt-1"
  };
  
  const buttonClasses = `
    ${baseClasses}
    ${layoutClasses}
    ${variantClasses[variant]}
    ${sizeClasses[variant]}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim();
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {IconComponent && (
        <IconComponent className={iconSizeClasses[variant]} />
      )}
      {icon && (
        <div className={iconSizeClasses[variant]}>
          {icon}
        </div>
      )}
      {buttonLabel && (
        <span className={textSizeClasses[variant]}>
          {buttonLabel}
        </span>
      )}
    </button>
  );
}
