import { getRoundedDateTime } from "./formHelpers.ts";

export const bottleFormConfig = {
  title: "Ajouter un biberon",
  fields: [
    { name: 'date_time', type: 'datetime-local' as const, required: true, defaultValue: getRoundedDateTime() },
    { name: 'type', type: 'select' as const, placeholder: 'Type de lait', required: true,
      options: [
        { label: 'Lait Maternel', value: 'Lait Maternel' },
        { label: 'Lait Infantile', value: 'Lait Infantile' }
    ] },
    { name: 'quantity', type: 'number' as const, placeholder: 'Quantité', required: true  },
    { name: 'comment', type: 'textarea' as const, placeholder: 'Commentaire' }
  ],
  submitButtonColor: 'bg-blue-500',
  isModal: true
};
