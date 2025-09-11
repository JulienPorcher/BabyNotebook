import { getCurrentDate } from "./formHelpers.ts";

export const bathFormConfig = {
  title: "Ajouter un bain",
  fields: [
    { name: 'date', type: 'date' as const, required: true, defaultValue: getCurrentDate() },
    { name: 'comment', type: 'textarea' as const, placeholder: 'Commentaire' }
  ],
  submitButtonColor: 'bg-green-500',
  isModal: true
};
