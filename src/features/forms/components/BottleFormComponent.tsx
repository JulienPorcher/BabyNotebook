import { useState } from "react";
import { Milk } from "lucide-react";
import { getRoundedDateTime } from "../formHelpers";

interface BottleFormComponentProps {
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onClose?: () => void;
  initialValues?: Record<string, any>;
  babyId?: string;
}

const commonQuantities = [30, 60, 90, 120, 150, 180, 210, 240];
const commonTypes = ['Lait Maternel', 'Lait Infantile'];

export default function BottleFormComponent({ onSubmit, onClose, initialValues, babyId }: BottleFormComponentProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>(initialValues || {});
  const [selectedQuantity, setSelectedQuantity] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [manualQuantity, setManualQuantity] = useState<string>('');
  const [comment, setComment] = useState("");
  const [dateTime, setDateTime] = useState(getRoundedDateTime());

  const handleQuickQuantity = (quantity: number) => {
    setSelectedQuantity(quantity.toString());
    setManualQuantity(''); // Clear manual input
    setFormValues({
      ...formValues,
      quantity: quantity
    });
  };

  const handleManualQuantityChange = (value: string) => {
    setManualQuantity(value);
    if (value) {
      setSelectedQuantity(null); // Cancel quick quantity selection
      setFormValues({
        ...formValues,
        quantity: parseInt(value) || 0
      });
    }
  };

  const handleQuickType = (type: string) => {
    setSelectedType(type);
    setFormValues({
      ...formValues,
      type: type
    });
  };

  const handleFormSubmit = async () => {
    const submitData = {
      date_time: dateTime,
      quantity: formValues.quantity || parseInt(manualQuantity) || 0,
      type: formValues.type || selectedType,
      comment: comment
    };
    localStorage.setItem(`lastBottle_${babyId}`, JSON.stringify(submitData));
    await onSubmit(submitData);
    setFormValues({});
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-96 space-y-4">
        <h2 className="text-lg font-semibold text-center">Ajouter un biberon</h2>
      
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

         {/* Quick quantity selection */}
         <div>
           <h3 className="text-sm font-medium text-gray-700 mb-2">Quantité</h3>
           <div className="grid grid-cols-4 gap-2 mb-3">
             {commonQuantities.map((qty) => (
               <button
                 key={qty}
                 onClick={() => handleQuickQuantity(qty)}
                 className={`p-3 rounded-lg transition-colors ${
                   selectedQuantity === qty.toString() 
                     ? 'bg-blue-200 text-blue-800 border-2 border-blue-300' 
                     : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                 }`}
               >
                 {qty}ml
               </button>
             ))}
           </div>
           {/* Manual quantity input */}
           <div className="flex items-center gap-2">
             <input
               type="number"
               value={manualQuantity}
               onChange={(e) => handleManualQuantityChange(e.target.value)}
               placeholder="Quantité personnalisée (ml)"
               className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             />
             <span className="text-sm text-gray-500">ml</span>
           </div>
         </div>

         {/* Quick type selection */}
         <div>
           <h3 className="text-sm font-medium text-gray-700 mb-2">Type de lait</h3>
           <div className="grid grid-cols-2 gap-2">
             {commonTypes.map((type) => (
               <button
                 key={type}
                 onClick={() => handleQuickType(type)}
                 className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                   selectedType === type 
                     ? 'bg-green-200 text-green-800 border-2 border-green-300' 
                     : 'bg-green-50 text-green-700 hover:bg-green-100'
                 }`}
               >
                 <Milk className="w-4 h-4" />
                 {type}
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
        {/* Submit Buttons */}
        <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 py-2 rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={handleFormSubmit}
              className="flex-1 bg-pink-500 text-white py-2 rounded-lg"
            >
              Enregistrer
            </button>
          </div>
      </div>
    </div>
  );
}
