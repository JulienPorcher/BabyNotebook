export const babyFormConfig = {
  title: "Créer un carnet de bébé",
  fields: [
    { name: 'name', type: 'text' as const, placeholder: 'Nom du bébé', required: true },
    { name: 'birth_date', type: 'date' as const, label: 'Date de naissance', required: true },
    { name: 'gender', type: 'select' as const, placeholder: 'Genre (M/F)', required: true,
      options: [
        { label: 'Masculin', value: 'M' },
        { label: 'Féminin', value: 'F' }
    ] }
  ],
  submitButtonColor: 'bg-blue-500',
  isModal: true
};
