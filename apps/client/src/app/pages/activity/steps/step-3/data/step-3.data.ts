import { IGoodToKnow } from "../step-3.interface";

export const goodToKnowOptions: IGoodToKnow[] = [
    {
        name: 'Vêtement',
        description: 'Tenue confortable conseillée',
        iconName: 'clothing'
    },
    {
        name: 'Nourriture & boissons',
        description: 'Vous pouvez apporter ou commander à manger. Boissons et confiseries en vente sur place.',
        iconName: 'cutlery'
    },
    {
        name: 'Materiel',
        description: 'Tout le matériel nécessaire est inclus.',
        iconName: 'paint-tool'
    },
    {
        name: 'Risques',
        description: 'L\'activité peut provoquer quelques éclaboussures ou salissures.',
        iconName: 'new-release'
    },
    {
        name: 'Interdiction',
        description: 'Interdiction de fumer et de consommer de l\'alcool dans les locaux.',
        iconName: 'alert-triangle'
    },
    {
        name: 'Photos autorisées',
        description: 'Les photos sont autorisées durant l\'activité.',
        iconName: 'camera'
    },
    {
        name: 'Photos non autorisées',
        description: 'Les photos ne sont pas autorisées durant l\'activité.',
        iconName: 'camera-slash'
    },
];

export const errorMessages: Record<string, Record<string, string>> = {
    goodToKnow: {
        required: 'Veuillez sélectionner au moins deux éléments "Bon à savoir".'
    },
    program: {
        required: 'Le programme de l\'activité est obligatoire.',
        incompleteProgramm: 'Chaque étape du programme doit avoir un titre, une description et une image.'
    },
};
