import { useState } from "react";

export type FormPage = 'bath' | 'meal' | 'diaper' | 'activity' | 'weight' | 'measure';

interface FormField {
  name: string;
  type: 'text' | 'number' | 'textarea' | 'datetime-local' | 'date';
  placeholder?: string;
  label?: string;
  required?: boolean;
  step?: string;
}

interface FormConfig {
  title: string;
  fields: FormField[];
  submitButtonColor: string;
  isModal: boolean;
}

const formConfigs: Record<FormPage, FormConfig> = {
  bath: {
    title: "Ajouter un bain",
    fields: [
      { name: 'date', type: 'datetime-local', required: true },
      { name: 'comment', type: 'textarea', placeholder: 'Commentaire' }
    ],
    submitButtonColor: 'bg-green-500',
    isModal: true
  },
  meal: {
    title: "Ajouter un repas",
    fields: [
      { name: 'dateTime', type: 'datetime-local', required: true },
      { name: 'type', type: 'text', placeholder: 'Type (biberon, purée...)', required: true },
      { name: 'quantity', type: 'number', placeholder: 'Quantité' },
      { name: 'comment', type: 'textarea', placeholder: 'Commentaire' }
    ],
    submitButtonColor: 'bg-blue-500',
    isModal: true
  },
  diaper: {
    title: "Ajouter une couche",
    fields: [
      { name: 'dateTime', type: 'datetime-local', required: true },
      { name: 'type', type: 'text', placeholder: 'Type (pipi, caca, mixte)', required: true },
      { name: 'quantity', type: 'text', placeholder: 'Quantité' },
      { name: 'comment', type: 'textarea', placeholder: 'Commentaire' }
    ],
    submitButtonColor: 'bg-green-500',
    isModal: true
  },
  activity: {
    title: "Ajouter une activité",
    fields: [
      { name: 'date', type: 'date', label: 'Date' },
      { name: 'title', type: 'text', label: 'Titre' },
      { name: 'description', type: 'textarea', label: 'Description' }
    ],
    submitButtonColor: 'bg-blue-500',
    isModal: false
  },
  weight: {
    title: "Ajouter un poids",
    fields: [
      { name: 'date', type: 'date', label: 'Date' },
      { name: 'weight', type: 'number', label: 'Poids (kg)', step: '0.01' },
      { name: 'comment', type: 'textarea', label: 'Commentaire' }
    ],
    submitButtonColor: 'bg-purple-500',
    isModal: false
  },
  measure: {
    title: "Ajouter une mesure",
    fields: [
      { name: 'date', type: 'date', label: 'Date' },
      { name: 'height', type: 'number', label: 'Taille (cm)' },
      { name: 'comment', type: 'textarea', label: 'Commentaire' }
    ],
    submitButtonColor: 'bg-green-500',
    isModal: false
  }
};

interface UnifiedFormProps {
  page: FormPage;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onClose?: () => void;
}

export default function UnifiedForm({ page, onSubmit, onClose }: UnifiedFormProps) {
  const config = formConfigs[page];
  const [formData, setFormData] = useState<Record<string, any>>({});

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
    
    // Reset form
    setFormData({});
    
    // Close modal if applicable
    if (config.isModal && onClose) {
      onClose();
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      value: formData[field.name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
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
