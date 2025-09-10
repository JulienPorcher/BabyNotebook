import { useState } from "react";
import BreastForm from "./BreastForm";

export type FormPage = 'bath' | 'diaper' | 'activity' | 'weight' | 'measure' | 'bottle' | 'pump' | 'meal' | 'breast' | 'baby';
// Helper function to round time to nearest 5 minutes
const getRoundedDateTime = () => {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.round(minutes / 5) * 5;
  now.setMinutes(roundedMinutes, 0, 0);
  return now.toISOString().slice(0, 16); // Format for datetime-local input
};

// Helper function to get current date
const getCurrentDate = () => {
  return new Date().toISOString().slice(0, 10); // Format for date input
};

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
  meal: {
    title: "Ajouter un repas",
    fields: [
      { name: 'date_time', type: 'datetime-local', required: true, defaultValue: getRoundedDateTime() },
      { name: 'nom', type: 'text', placeholder: 'Nom du repas'},
      { name: 'fruits', type: 'number', placeholder: 'Fruits (g)'},
      { name: 'cereals', type: 'number', placeholder: 'Céréales (g)'},
      { name: 'vegetables', type: 'number', placeholder: 'Légumes (g)'},
      { name: 'meat_proteins', type: 'number', placeholder: 'Viande & Protéines (g)'},
      { name: 'dairy_products', type: 'number', placeholder: 'Produits laitiers (g)'},
      { name: 'other', type: 'number', placeholder: 'Autres aliments(g)'},
      { name: 'comment', type: 'textarea', placeholder: 'Commentaire' }
    ],
    submitButtonColor: 'bg-blue-500',
    isModal: true
  },
  bath: {
    title: "Ajouter un bain",
    fields: [
      { name: 'date', type: 'date', required: true, defaultValue: getCurrentDate() },
      { name: 'comment', type: 'textarea', placeholder: 'Commentaire' }
    ],
    submitButtonColor: 'bg-green-500',
    isModal: true
  },
  bottle: {
    title: "Ajouter un biberon",
    fields: [
      { name: 'date_time', type: 'datetime-local', required: true, defaultValue: getRoundedDateTime() },
      { name: 'type', type: 'select', placeholder: 'Type de lait', required: true,
        options: [
          { label: 'Lait Maternel', value: 'Lait Maternel' },
          { label: 'Lait Infantile', value: 'Lait Infantile' }
      ] },
      { name: 'quantity', type: 'number', placeholder: 'Quantité', required: true  },
      { name: 'comment', type: 'textarea', placeholder: 'Commentaire' }
    ],
    submitButtonColor: 'bg-blue-500',
    isModal: true
  },pump: {
    title: "Ajouter une expression",
    fields: [
      { name: 'date_time', type: 'datetime-local', required: true, defaultValue: getRoundedDateTime() },
      { name: 'left_quantity', type: 'number', placeholder: 'Quantité Sein Gauche', required: true  },
      { name: 'right_quantity', type: 'number', placeholder: 'Quantité Sein Droit', required: true  },
      { name: 'comment', type: 'textarea', placeholder: 'Commentaire' }
    ],
    submitButtonColor: 'bg-blue-500',
    isModal: true
  },
  diaper: {
    title: "Ajouter une couche",
    fields: [
      { name: 'date_time', type: 'datetime-local', required: true, defaultValue: getRoundedDateTime() },
      { name: 'type', type: 'select', placeholder: 'Urine, Selle ou Mixte', required: true, defaultValue: 'Urine',
        options: [
          { label: 'Urine', value: 'Urine' },
          { label: 'Selle', value: 'Selle' },
          { label: 'Mixte', value: 'Mixte' }
      ]  },
      { name: 'quantity', type: 'select', placeholder: 'Quantité', required: true,
        options: [
          { label: 'Petite', value: 'Petite' },
          { label: 'Moyenne', value: 'Moyenne' },
          { label: 'Grande', value: 'Grande' }
      ]  },
      { name: 'comment', type: 'textarea', placeholder: 'Commentaire' }
    ],
    submitButtonColor: 'bg-green-500',
    isModal: true
  },
  activity: {
    title: "Ajouter une activité",
    fields: [
      { name: 'date', type: 'date', label: 'Date', required: true, defaultValue: getRoundedDateTime() },
      { name: 'title', type: 'text', label: 'Titre', required: true  },
      { name: 'description', type: 'textarea', label: 'Description' }
    ],
    submitButtonColor: 'bg-blue-500',
    isModal: true
  },
  weight: {
    title: "Ajouter un poids",
    fields: [
      { name: 'date', type: 'date', label: 'Date', required: true, defaultValue: getRoundedDateTime() },
      { name: 'weight', type: 'number', label: 'Poids (kg)', step: '0.01', required: true  },
      { name: 'comment', type: 'textarea', label: 'Commentaire' }
    ],
    submitButtonColor: 'bg-purple-500',
    isModal: true
  },
  measure: {
    title: "Ajouter une mesure",
    fields: [
      { name: 'date', type: 'date', label: 'Date', required: true, defaultValue: getRoundedDateTime() },
      { name: 'height', type: 'number', label: 'Taille (cm)', required: true  },
      { name: 'comment', type: 'textarea', label: 'Commentaire' }
    ],
    submitButtonColor: 'bg-green-500',
    isModal: true
  },
  breast: {
    title: "Allaitement",
    fields: [
      { name: 'comment', type: 'textarea', placeholder: 'Commentaire' }
    ],
    submitButtonColor: 'bg-pink-500',
    isModal: true
  },
  baby: {
    title: "Créer un carnet de bébé",
    fields: [
      { name: 'name', type: 'text', placeholder: 'Nom du bébé', required: true },
      { name: 'birth_date', type: 'date', label: 'Date de naissance', required: true },
      { name: 'gender', type: 'select', placeholder: 'Genre (M/F)', required: true,
        options: [
          { label: 'Masculin', value: 'M' },
          { label: 'Féminin', value: 'F' }
      ] }
    ],
    submitButtonColor: 'bg-blue-500',
    isModal: true
  }
};

interface UnifiedFormProps {
  page: FormPage;
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onClose?: () => void;
  initialValues?: Record<string, any>;
  babyId?: string;
}

export default function UnifiedForm({ page, onSubmit, onClose, initialValues, babyId }: UnifiedFormProps) {
  // Handle special breast form
  if (page === 'breast') {
    return (
      <BreastForm
        onSubmit={(data) => onSubmit(data)}
        onClose={onClose || (() => {})}
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
