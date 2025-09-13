import { getCurrentDate } from "./formHelpers.ts";

export const weightFormConfig = {
  title: "Ajouter un poids",
  fields: [
    { name: 'date', type: 'date' as const, label: 'Date', required: true, defaultValue: getCurrentDate() },
    { name: 'weight', type: 'number' as const, label: 'Poids (kg)', step: '0.01', required: true  },
    { name: 'comment', type: 'textarea' as const, label: 'Commentaire' }
  ],
  submitButtonColor: 'bg-purple-500',
  isModal: true
};
