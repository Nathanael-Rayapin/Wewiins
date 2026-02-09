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
    {
        path: 'activités',
        loadComponent: () => import('./pages/activity/activity').then(m => m.Activity),
        loadChildren: () => import('./pages/activity/activity.routes').then(m => m.activityRoutes),
        title: 'Activités'
    },
];
