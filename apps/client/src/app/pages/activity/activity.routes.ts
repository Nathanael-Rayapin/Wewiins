import { Routes } from '@angular/router';

export const activityRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./activity-list/activity-list').then(m => m.ActivityList),
        title: 'Liste des activités'
    },
    {
        path: 'nouvelle',
        loadComponent: () => import('./steps-skeleton/steps-skeleton').then(m => m.StepsSkeleton),
        title: 'Nouvelle activité'
    },
];
