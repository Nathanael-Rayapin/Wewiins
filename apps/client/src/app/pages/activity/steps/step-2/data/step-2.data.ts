export const automaticValidationOptions = [
    { name: 'Automatique', code: 'Automatic' },
    { name: 'Manuelle', code: 'Manual' }
];

export const childAllowedWithAdultOptions = [
    { name: 'Oui', code: 'Yes' },
    { name: 'Non', code: 'No' }
];

export const errorMessages: Record<string, Record<string, string>> = {
    minCapacity: {
        required: 'Le nombre min. de personnes est requis',
        min: 'Le nombre min. de personnes autorisé est de 1',
        max: 'Le nombre max. de personnes autorisé est de 98'
    },
    maxCapacity: {
        required: 'Le nombre max. de personnes est requis',
        max: 'Le nombre max. de personnes autorisé est de 99'
    },
    slotDuration: {
        required: 'La durée de l\'activité est requise',
        min: 'La durée de l\'activité est de 30 minutes',
        max: 'La durée de l\'activité est de 1440 minutes'
    },
    minAge: {
        required: 'L\'âge minimum est requis',
        min: 'L\'âge minimum autorisé est de 1',
        max: 'L\'âge maximum autorisé est de 98'
    },
    maxAge: {
        required: 'L\'âge maximum est requis',
        max: 'L\'âge maximum autorisé est de 99'
    },
    maxAgeChild: {
        required: 'L\'âge max. des enfants est requis',
        min: 'L\'âge max. des enfants autorisé est de 3',
        max: 'L\'âge max. des enfants autorisé est de 17'
    },
    automaticValidation: {
        required: 'Ce champ est requis'
    },
    childAllowedWithAdult: {
        required: 'Ce champ est requis'
    }
};
    
export type AvailabilityDayFullName = typeof availabilityDays[number]['fullname'];
export const availabilityDays = [
    { name: 'Lun.', fullname: 'Lundi' },
    { name: 'Mar.', fullname: 'Mardi' },
    { name: 'Mer.', fullname: 'Mercredi' },
    { name: 'Jeu.', fullname: 'Jeudi' },
    { name: 'Ven.', fullname: 'Vendredi' },
    { name: 'Sam.', fullname: 'Samedi' },
    { name: 'Dim.', fullname: 'Dimanche' },
] as const;

export const DAY_ORDER: AvailabilityDayFullName[] = availabilityDays.
    map(d => d.fullname.slice(0, 3).toUpperCase() as AvailabilityDayFullName);