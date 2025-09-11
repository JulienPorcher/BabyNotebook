import { useState } from "react";
import { Apple, Wheat, Leaf, Ham, Milk, ChefHat } from "lucide-react";
import { getRoundedDateTime } from "../formHelpers";

interface MealFormComponentProps {
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  onClose?: () => void;
  babyId?: string;
}

const mealsDetails = [
  { id: 'fruits', label: 'Fruits', icon: <Apple className="w-4 h-4" />, color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
  { id: 'cereals', label: 'Céréales', icon: <Wheat className="w-4 h-4" />, color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
  { id: 'vegetables', label: 'Légumes', icon: <Leaf className="w-4 h-4" />, color: 'bg-green-50 text-green-700 hover:bg-green-100' },
  { id: 'meat_proteins', label: 'Viande & Protéines', icon: <Ham className="w-4 h-4" />, color: 'bg-red-50 text-red-700 hover:bg-red-100' },
  { id: 'dairy_products', label: 'Produits laitiers', icon: <Milk className="w-4 h-4" />, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
  { id: 'other', label: 'Autres aliments', icon: <ChefHat className="w-4 h-4" />, color: 'bg-gray-50 text-gray-700 hover:bg-gray-100' }
];



export default function MealFormComponent({ onSubmit, onClose, babyId }: MealFormComponentProps) {
  const [manualQuantity, setManualQuantity] = useState<Record<string, string>>({});
  const [dateTime, setDateTime] = useState(getRoundedDateTime());
  const [comment, setComment] = useState<string>('');
  const [nom, setNom] = useState<string>('');

  const handleManualQuantity = (id: string, value: string) => {
    setManualQuantity((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  /*const handleSaveAsTemplate = () => {
    // Save current form as template
    const template = {
      nom: formValues.nom,
      fruits: formValues.fruits,
      cereals: formValues.cereals,
      vegetables: formValues.vegetables,
      meat_proteins: formValues.meat_proteins,
      dairy_products: formValues.dairy_products,
      other: formValues.other
    };
    localStorage.setItem(`mealTemplate_${babyId}`, JSON.stringify(template));
  };*/

  const handleFormSubmit = async () => {
    const submitData = {
      date_time: dateTime,
      nom: nom,
      fruits: parseInt(manualQuantity.fruits) || 0,
      cereals: parseInt(manualQuantity.cereals) || 0,
      vegetables: parseInt(manualQuantity.vegetables) || 0,
      meat_proteins: parseInt(manualQuantity.meat_proteins) || 0,
      dairy_products: parseInt(manualQuantity.dairy_products) || 0,
      other: parseInt(manualQuantity.other) || 0,
      comment: comment
    };
    
    // Save as last meal for copy functionality
    localStorage.setItem(`lastMeal_${babyId}`, JSON.stringify(submitData));
    await onSubmit(submitData);
  };

 


  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-96 space-y-4">
        <h2 className="text-lg font-semibold text-center">Ajouter un repas</h2>
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
        {/* Manual quantity input */}
        <h3 className="text-sm font-medium text-gray-700 mb-2">Nutriments</h3>
        <div className="grid grid-cols-2 gap-4 mb-3">
          {mealsDetails.map((item) => (
            <div key={item.id} className="relative">
              {/* Icône à gauche */}
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                {item.icon}
              </span>

              {/* Input */}
              <input
                type="number"
                value={manualQuantity[item.id] || ""}
                className={`w-full pl-9 pr-10 py-3 rounded-lg placeholder-gray-400 ${item.color}`}
                onChange={(e) => handleManualQuantity(item.id, e.target.value)} // 👈 passe l’id + valeur
              />
              {/* Label qui joue le rôle de placeholder */}
              {!manualQuantity[item.id] && (
                  <label
                    htmlFor={item.id}
                    className="absolute left-9 right-10 top-1/2 -translate-y-1/2 text-gray-400 text-sm leading-tight pointer-events-none whitespace-normal"
                  >
                    {item.label}
                  </label>
                )}
              {/*Unité */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                gr
              </span>
            </div>
          ))}
        </div>
        {/* Additional meal-specific actions */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full border rounded-lg p-2"
            placeholder="Nom du repas (optionnel)"
          />
          {/*<button
            onClick={handleSaveAsTemplate}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm"
          >
            <Save className="w-4 h-4" />
            Sauvegarder modèle
          </button>*/}
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
