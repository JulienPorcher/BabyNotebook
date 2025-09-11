import { getRoundedDateTime } from "./formHelpers.ts";

export const weightFormConfig = {
  title: "Ajouter un poids",
  fields: [
    { name: 'date', type: 'date' as const, label: 'Date', required: true, defaultValue: getRoundedDateTime() },
    { name: 'weight', type: 'number' as const, label: 'Poids (kg)', step: '0.01', required: true  },
    { name: 'comment', type: 'textarea' as const, label: 'Commentaire' }
  ],
  submitButtonColor: 'bg-purple-500',
  isModal: true
};
