import { useState } from "react";
import { breastFormConfig } from "./BreastForm";
import { mealFormConfig } from "./MealForm";
import { bathFormConfig } from "./BathForm";
import { bottleFormConfig } from "./BottleForm";
import { pumpFormConfig } from "./PumpForm";
import { diaperFormConfig } from "./DiaperForm";
import { activityFormConfig } from "./ActivityForm";
import { weightFormConfig } from "./WeightForm";
import { measureFormConfig } from "./MeasureForm";
import { babyFormConfig } from "./BabyForm";
import { MealFormComponent, BottleFormComponent, DiaperFormComponent, BreastFormComponent } from "./components";

export type FormPage = 'bath' | 'diaper' | 'activity' | 'weight' | 'measure' | 'bottle' | 'pump' | 'meal' | 'breast' | 'baby';

interface FormField {
  name: string;
  type: 'text' | 'number' | 'textarea' | 'datetime-local' | 'date' | 'select';
  placeholder?: string;
  label?: string;
  required?: boolean;
  defaultValue?: string;
  step?: string;
  options?: { label: string; value: string }[];
}

interface FormConfig {
  title: string;
  fields: FormField[];
  submitButtonColor: string;
  isModal: boolean;
}

const formConfigs: Record<FormPage, FormConfig> = {
  meal: mealFormConfig,
  bath: bathFormConfig,
  bottle: bottleFormConfig,
  pump: pumpFormConfig,
  diaper: diaperFormConfig,
  activity: activityFormConfig,
  weight: weightFormConfig,
  measure: measureFormConfig,
  breast: breastFormConfig,
  baby: babyFormConfig
};

interface UnifiedFormProps {
  page: FormPage;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onClose?: () => void;
  initialValues?: Record<string, any>;
  babyId?: string;
}

// Factory function to get the appropriate form component
export function getFormComponent(page: FormPage) {
  switch (page) {
    case 'meal':
      return MealFormComponent;
    case 'bottle':
      return BottleFormComponent;
    case 'diaper':
      return DiaperFormComponent;
    case 'breast':
      return BreastFormComponent;
    default:
      return null; // Use basic UnifiedForm for other types
  }
}

export default function UnifiedForm({ page, onSubmit, onClose, initialValues, babyId }: UnifiedFormProps) {
  // Check if there's a specialized component for this page
  const SpecializedComponent = getFormComponent(page);
  
  if (SpecializedComponent) {
    return (
      <SpecializedComponent
        onSubmit={(data) => onSubmit(data)}
        onClose={onClose || (() => {})}
        initialValues={initialValues}
        babyId={babyId}
      />
    );
  }


  const config = formConfigs[page];
  const [formData, setFormData] = useState<Record<string, any>>(initialValues || {});

  // Get last bottle type from localStorage
  const getLastBottleType = () => {
    if (page === 'bottle' && babyId) {
      const key = `lastBottleType_${babyId}`;
      return localStorage.getItem(key) || undefined;
    }
    return undefined;
  };

  const lastBottleType = getLastBottleType();

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = config.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.name]);
    
    if (missingFields.length > 0) {
      return;
    }

    // Convert numeric fields
    const processedData = { ...formData };
    config.fields.forEach(field => {
      if (field.type === 'number' && processedData[field.name] !== undefined) {
        processedData[field.name] = Number(processedData[field.name]);
      }
    });

    await onSubmit(processedData);
    
    // Save last bottle type to localStorage if it's a bottle form
    if (page === 'bottle' && babyId && processedData.type) {
      const key = `lastBottleType_${babyId}`;
      localStorage.setItem(key, processedData.type);
    }
    
    // Reset form
    setFormData({});
    
    // Close modal if applicable
    if (config.isModal && onClose) {
      onClose();
    }
  };

  const renderField = (field: FormField) => {
    // Special handling for bottle type field
    let fieldValue = formData[field.name] || field.defaultValue || '';
    if (field.name === 'type' && page === 'bottle' && lastBottleType && !formData[field.name]) {
      fieldValue = lastBottleType;
    }

    const commonProps = {
      value: fieldValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleInputChange(field.name, e.target.value),
      className: "w-full border rounded-xl p-2",
      required: field.required,
      placeholder: field.placeholder,
      step: field.step
    };

    if (field.type === 'textarea') {
      return (
        <textarea
          {...commonProps}
          rows={3}
        />
      );
    }

    if (field.type === 'select') {
      return (
        <select {...commonProps}>
          <option value="">{field.placeholder}</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type}
        {...commonProps}
      />
    );
  };

  const formContent = (
    <form onSubmit={handleSubmit} className={config.isModal ? "bg-white rounded-2xl shadow-lg p-6 w-80 space-y-3" : "space-y-3"}>
      <h2 className="text-lg font-semibold">{config.title}</h2>

      {config.fields.map((field) => (
        <div key={field.name}>
          {field.label && (
            <label className="text-sm text-gray-600">{field.label}</label>
          )}
          {renderField(field)}
        </div>
      ))}

      <div className={config.isModal ? "flex justify-end gap-2" : ""}>
        {config.isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-200 px-3 py-2 rounded-xl"
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          className={`${config.submitButtonColor} text-white ${config.isModal ? 'px-3 py-2 rounded-xl' : 'w-full p-2 rounded-xl'}`}
        >
          Enregistrer
        </button>
      </div>
    </form>
  );

  if (config.isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        {formContent}
      </div>
    );
  }

  return formContent;
}
