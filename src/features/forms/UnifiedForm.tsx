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
import { useFormSubmission } from "./formHelpers";
import FormWrapper from "./components/FormWrapper";

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
  babyId?: string;
}

export default function UnifiedForm({ page, onSubmit, onClose, babyId }: UnifiedFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const config = formConfigs[page];

  const { error, isSubmitting, handleSubmit } = useFormSubmission({ onSubmit, onClose });

  // Specialized components
  const getFormComponent = () => {
    switch (page) {
      case 'meal':
        return <MealFormComponent onSubmit={onSubmit} onClose={onClose} babyId={babyId} />;
      case 'bottle':
        return <BottleFormComponent onSubmit={onSubmit} onClose={onClose} babyId={babyId} />;
      case 'diaper':
        return <DiaperFormComponent onSubmit={onSubmit} onClose={onClose} babyId={babyId} />;
      case 'breast':
        return <BreastFormComponent onSubmit={onSubmit} onClose={onClose || (() => {})} />;
      default:
        return null;
    }
  };

  const SpecializedComponent = getFormComponent();
  if (SpecializedComponent) {
    return SpecializedComponent;
  }

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const renderField = (field: FormField) => {
    const commonProps = {
      name: field.name,
      value: formData[field.name] || field.defaultValue || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => 
        handleInputChange(field.name, e.target.value),
      placeholder: field.placeholder,
      required: field.required,
      step: field.step,
      className: "w-full border rounded-lg p-2"
    };

    if (field.type === 'textarea') {
      return <textarea {...commonProps} rows={3} />;
    }

    if (field.type === 'select') {
      return (
        <select {...commonProps}>
          <option value="">Sélectionner...</option>
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

  return (
    <FormWrapper
      title={config.title}
      onSubmit={async () => {
        // Validate required fields
        const requiredFields = config.fields.filter(field => field.required);
        const missingFields = requiredFields.filter(field => {
          const value = formData[field.name] || field.defaultValue || '';
          return !value;
        });
        
        if (missingFields.length > 0) {
          console.log('Missing required fields:', missingFields.map(f => f.name));
          return;
        }

        // Convert numeric fields and include default values
        const processedData = { ...formData };
        config.fields.forEach(field => {
          const value = processedData[field.name] || field.defaultValue || '';
          if (field.type === 'number' && value !== undefined && value !== '') {
            processedData[field.name] = Number(value);
          } else if (value) {
            processedData[field.name] = value;
          }
        });

        console.log('Submitting data:', processedData);
        await handleSubmit(processedData);
      }}
      onClose={onClose}
      error={error}
      isSubmitting={isSubmitting}
      submitButtonColor={config.submitButtonColor}
    >
      {config.fields.map((field) => (
        <div key={field.name}>
          {field.label && (
            <label className="text-sm text-gray-600">{field.label}</label>
          )}
          {renderField(field)}
        </div>
      ))}
    </FormWrapper>
  );
}