import { getRoundedDateTime } from "./formHelpers.ts";

export const pumpFormConfig = {
  title: "Ajouter une expression",
  fields: [
    { name: 'date_time', type: 'datetime-local' as const, required: true, defaultValue: getRoundedDateTime() },
    { name: 'left_quantity', type: 'number' as const, placeholder: 'Quantité Sein Gauche', required: true  },
    { name: 'right_quantity', type: 'number' as const, placeholder: 'Quantité Sein Droit', required: true  },
    { name: 'comment', type: 'textarea' as const, placeholder: 'Commentaire' }
  ],
  submitButtonColor: 'bg-blue-500',
  isModal: true
};
