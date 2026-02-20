export const categoriesData = [
    { name: "Ateliers créatifs" },
    { name: "Loisirs extremes" },
    { name: "Gastronomie" },
    { name: "Tourisme" },
    { name: "Nautiques" },
    { name: "Famille" },
    { name: "Bien-être" },
    { name: "Sportif" },
    { name: "Culture" },
    { name: "Avec animaux" },
]

export const errorMessages: Record<string, Record<string, string>> = {
    name: {
        required: 'Le nom est requis',
        minlength: 'Le nom doit contenir au moins 3 caractères'
    },
    categories: {
        required: 'Au moins une catégorie est requise',
        minlength: 'Au moins une catégorie est requise'
    },
    description: {
        required: 'La description est requise',
        minlength: 'La description doit contenir au moins 10 caractères',
        maxlength: 'La description ne peut pas dépasser 500 caractères'
    },
    photos: {
        required: 'Les photos sont requises',
        minFiles: 'Vous devez ajouter au moins 3 photos',
        minlength: 'Au moins 3 photos sont requises',
        filesNotRestored: 'Veuillez re-sélectionner vos photos'
    }
};