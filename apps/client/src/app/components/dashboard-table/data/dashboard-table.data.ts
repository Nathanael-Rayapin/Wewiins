import { IDashboardColumn } from "../dashboard-table.interface";

export const dashboardColums: IDashboardColumn[] = [
    { field: 'reference', header: 'Référence' },
    { field: 'name', header: 'Nom' },
    { field: 'dateAndTime', header: 'Date et Heure' },
    { field: 'participants', header: 'Participants' },
    { field: 'title', header: 'Activité' },
    { field: 'totalPrice', header: 'Prix total' },
    { field: 'status', header: 'Statut' },
];
