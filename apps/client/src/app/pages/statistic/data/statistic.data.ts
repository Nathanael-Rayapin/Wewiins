import { signal } from "@angular/core";
import { IStatisticDto } from "../../../dto/statistic";
import { IStatisticKPIs } from "../statistic.interface";
import { defaultStats } from "../../dashboard/data/dashboard.data";

export const MONTH_THRESHOLD = 21;
export const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
export const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export const kpis: IStatisticKPIs[] = [
    {
        label: 'Taux de remplissage',
        value: 0,
        name: 'averageOccupancy',
        hasTooltip: true,
        tooltipValue: 'Pourcentage des créneaux publiés sur WeWiins qui ont été réservés sur la période sélectionnée.',
        unit: '%'
    },
    {
        label: 'Taux d\'annulation',
        value: 0,
        name: 'averageCancellation',
        hasTooltip: false,
        unit: '%'
    },
    {
        label: 'Nb. de participant moyen',
        value: 0,
        name: 'averageParticipants',
        hasTooltip: false
    },
    {
        label: 'Nb. de favoris',
        value: 0,
        name: 'totalFavorites',
        hasTooltip: true,
        tooltipValue: 'Nombre total de fois où vos activités ont été ajoutées en favori par des utilisateurs sur la période sélectionnée. Les favoris indiquent un intérêt avant décision et peuvent précéder une réservation.',
    }
];

export const defaultStatisticData = signal<IStatisticDto>({
    totalRevenue: {...defaultStats},
    totalCharges: {...defaultStats},
    totalBooking: {...defaultStats},
    averageOccupancy: {...defaultStats},
    averageCancellation: {...defaultStats},
    averageParticipants: {...defaultStats},
    totalFavorites: {...defaultStats},
    averageScore: {...defaultStats},
    visitsByPeriod: [],
    scoreDistribution: [],
    filterRangeDays: 0,
})