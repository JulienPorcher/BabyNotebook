import { useState } from "react";
import { Baby, Droplets, Clock } from "lucide-react";
import { getRoundedDateTime, useFormSubmission } from "../formHelpers";
import FormWrapper from "./FormWrapper";

interface DiaperFormComponentProps {
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onClose?: () => void;
  initialValues?: Record<string, any>;
  babyId?: string;
}

const diaperTypes = [
  { id: 'urine', label: 'Urine', icon: <Droplets className="w-4 h-4" />, color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
  { id: 'selle', label: 'Selle', icon: <Baby className="w-4 h-4" />, color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
  { id: 'mixte', label: 'Mixte', icon: <Clock className="w-4 h-4" />, color: 'bg-red-50 text-red-700 hover:bg-red-100' }
];

const quantityOptions = [
  { id: 'petite', label: 'Petite', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
  { id: 'moyenne', label: 'Moyenne', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
  { id: 'grande', label: 'Grande', color: 'bg-red-50 text-red-700 hover:bg-red-100' }
];

export default function DiaperFormComponent({ onSubmit, onClose, initialValues, babyId }: DiaperFormComponentProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues || {});
  const [comment, setComment] = useState("");
  const [dateTime, setDateTime] = useState(getRoundedDateTime());

  const { error, isSubmitting, handleSubmit } = useFormSubmission({ onSubmit, onClose });

  const handleFormSubmit = async () => {
    const submitData = {
      date_time: dateTime,
      type: formValues.type || 'Urine',
      quantity: formValues.quantity || 'Moyenne',
      comment: comment
    };
    localStorage.setItem(`lastDiaper_${babyId}`, JSON.stringify(submitData));
    await handleSubmit(submitData);
  };

  return (
    <FormWrapper
      title="Changer la couche"
      onSubmit={handleFormSubmit}
      onClose={onClose}
      error={error}
      isSubmitting={isSubmitting}
      submitButtonColor="bg-yellow-500"
    >
      {/* Date/Time Field */}
      <div>
        <label className="block text-sm font-medium mb-1">Date et heure</label>
        <input
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          className="w-full border rounded-lg p-2"
        />
      </div>

      {/* Type Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Type</h3>
        <div className="grid grid-cols-3 gap-2">
          {diaperTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setFormValues(prev => ({ ...prev, type: type.label }))}
              className={`p-3 rounded-lg text-center ${formValues.type === type.label ? 'ring-2 ring-pink-500' : ''} ${type.color}`}
            >
              <div className="flex flex-col items-center gap-1">
                {type.icon}
                <span className="text-xs">{type.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quantity Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Quantité</h3>
        <div className="grid grid-cols-3 gap-2">
          {quantityOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFormValues(prev => ({ ...prev, quantity: option.label }))}
              className={`p-3 rounded-lg text-center ${formValues.quantity === option.label ? 'ring-2 ring-pink-500' : ''} ${option.color}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comment Field */}
      <div>
        <label className="block text-sm font-medium mb-1">Commentaire</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded-lg p-2"
          rows={3}
          placeholder="Commentaire..."
        />
      </div>
    </FormWrapper>
  );
}