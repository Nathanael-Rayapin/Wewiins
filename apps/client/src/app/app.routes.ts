import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'tableau-de-bord',
        pathMatch: 'full'
    },
    {
        path: 'tableau-de-bord',
        component: Dashboard,
        title: 'Tableau de bord'
    },
];
