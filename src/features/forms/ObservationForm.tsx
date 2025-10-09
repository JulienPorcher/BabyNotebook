import { getRoundedDateTime } from "./formHelpers.ts";

export const observationFormConfig = {
  title: "Ajouter une observation",
  fields: [
    { name: 'date', type: 'date' as const, label: 'Date', required: true, defaultValue: getRoundedDateTime() },
    { name: 'title', type: 'text' as const, label: 'Titre', required: true  },
    { name: 'description', type: 'textarea' as const, label: 'Description' }
  ],
  submitButtonColor: 'bg-blue-500',
  isModal: true
};
