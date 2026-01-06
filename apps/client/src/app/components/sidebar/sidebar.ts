import { Component } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import { NavSidebar } from '../nav-sidebar/nav-sidebar';
import { ISidebarNavItem } from './sidebar.interface';

@Component({
  selector: 'app-sidebar',
  imports: [NgOptimizedImage, NavSidebar],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  protected navItemsData: ISidebarNavItem[] = [
    {
    id: 1,
    name: 'Tableau de bord',
    iconPath: 'assets/icons/dashboard.svg',
    iconActivePath: 'assets/icons/active-dashboard.svg',
    pagePath: '/tableau-de-bord'
  },{
    id: 2,
    name: 'Statistiques',
    iconPath: 'assets/icons/statistic.svg',
    iconActivePath: 'assets/icons/active-statistic.svg',
    pagePath: '/statistiques'
  },{
    id: 3,
    name: 'Réservations',
    iconPath: 'assets/icons/booking.svg',
    iconActivePath: 'assets/icons/active-booking.svg',
    pagePath: '/réservations'
  },{
    id: 4,
    name: 'Activités',
    iconPath: 'assets/icons/activity.svg',
    iconActivePath: 'assets/icons/active-activity.svg',
    pagePath: '/activités'
  },{
    id: 5,
    name: 'Promotions',
    iconPath: 'assets/icons/discount.svg',
    iconActivePath: 'assets/icons/active-discount.svg',
    pagePath: '/promotions'
  },{
    id: 6,
    name: 'Avis',
    iconPath: 'assets/icons/review.svg',
    iconActivePath: 'assets/icons/active-review.svg',
    pagePath: '/avis'
  },{
    id: 7,
    name: 'Notification',
    iconPath: 'assets/icons/notification.svg',
    iconActivePath: 'assets/icons/active-notification.svg',
    pagePath: '/notifications'
  },
];

  protected settingItemsData: ISidebarNavItem[] = [
  {
    id: 8,
    name: 'Paramètres',
    iconPath: 'assets/icons/parameter.svg',
    iconActivePath: 'assets/icons/active-parameter.svg',
    pagePath: '/paramètres'
  },{
    id: 9,
    name: 'Support',
    iconPath: 'assets/icons/support.svg',
    iconActivePath: 'assets/icons/active-support.svg',
    pagePath: '/support'
  },
];
}
