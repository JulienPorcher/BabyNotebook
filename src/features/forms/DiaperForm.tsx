import { getRoundedDateTime } from "./formHelpers.ts";

export const diaperFormConfig = {
  title: "Ajouter une couche",
  fields: [
    { name: 'date_time', type: 'datetime-local' as const, required: true, defaultValue: getRoundedDateTime() },
    { name: 'type', type: 'select' as const, placeholder: 'Urine, Selle ou Mixte', required: true, defaultValue: 'Urine',
      options: [
        { label: 'Urine', value: 'Urine' },
        { label: 'Selle', value: 'Selle' },
        { label: 'Mixte', value: 'Mixte' }
    ]  },
    { name: 'quantity', type: 'select' as const, placeholder: 'Quantité', required: true,
      options: [
        { label: 'Petite', value: 'Petite' },
        { label: 'Moyenne', value: 'Moyenne' },
        { label: 'Grande', value: 'Grande' }
    ]  },
    { name: 'comment', type: 'textarea' as const, placeholder: 'Commentaire' }
  ],
  submitButtonColor: 'bg-green-500',
  isModal: true
};
