import { getRoundedDateTime } from "./formHelpers.ts";

export const measureFormConfig = {
  title: "Ajouter une mesure",
  fields: [
    { name: 'date', type: 'date' as const, label: 'Date', required: true, defaultValue: getRoundedDateTime() },
    { name: 'height', type: 'number' as const, label: 'Taille (cm)', required: true  },
    { name: 'comment', type: 'textarea' as const, label: 'Commentaire' }
  ],
  submitButtonColor: 'bg-green-500',
  isModal: true
};
