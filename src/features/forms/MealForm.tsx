import { getRoundedDateTime } from "./formHelpers.ts";

export const mealFormConfig = {
  title: "Ajouter un repas",
  fields: [
    { name: 'date_time', type: 'datetime-local' as const, required: true, defaultValue: getRoundedDateTime() },
    { name: 'nom', type: 'text' as const, placeholder: 'Nom du repas'},
    { name: 'fruits', type: 'number' as const, placeholder: 'Fruits (g)'},
    { name: 'cereals', type: 'number' as const, placeholder: 'Céréales (g)'},
    { name: 'vegetables', type: 'number' as const, placeholder: 'Légumes (g)'},
    { name: 'meat_proteins', type: 'number' as const, placeholder: 'Viande & Protéines (g)'},
    { name: 'dairy_products', type: 'number' as const, placeholder: 'Produits laitiers (g)'},
    { name: 'other', type: 'number' as const, placeholder: 'Autres aliments(g)'},
    { name: 'comment', type: 'textarea' as const, placeholder: 'Commentaire' }
  ],
  submitButtonColor: 'bg-blue-500',
  isModal: true
};
