import { IStatisticKPIs, IVoteDistribution } from "../statistic.interface";

export const kpis: IStatisticKPIs[] = [
    {
        label: 'Taux de remplissage',
        value: 60,
        hasTooltip: true,
        tooltipValue: 'Pourcentage des créneaux publiés sur WeWiins qui ont été réservés sur la période sélectionnée.',
        unit: '%'
    },
    {
        label: 'Taux d\'annulation',
        value: 10,
        hasTooltip: false,
        unit: '%'
    },
    {
        label: 'Nb. de participant moyen',
        value: 4,
        hasTooltip: false
    },
    {
        label: 'Liste de favoris',
        value: 120,
        hasTooltip: true,
        tooltipValue: 'Nombre total de fois où vos activités ont été ajoutées en favori par des utilisateurs sur la période sélectionnée. Les favoris indiquent un intérêt avant décision et peuvent précéder une réservation.',
    }
];

export const votes: IVoteDistribution[] = [
  { star: 1, count: 0 },
  { star: 2, count: 5 },
  { star: 3, count: 5 },
  { star: 4, count: 30 },
  { star: 5, count: 60 },
];