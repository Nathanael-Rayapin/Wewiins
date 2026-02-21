import { Component, inject } from '@angular/core';
import { NavSidebar } from '../nav-sidebar/nav-sidebar';
import { ISidebarNavItem } from './sidebar.interface';
import { KeycloakService } from '../../services/keycloak.service';
import { IconSvg } from '../icon-svg/icon-svg';

@Component({
  selector: 'app-sidebar',
  imports: [NavSidebar, IconSvg],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private keycloakService = inject(KeycloakService);

  protected navItemsData: ISidebarNavItem[] = [
    {
    id: 1,
    name: 'Tableau de bord',
    iconName: 'dashboard',
    pagePath: '/tableau-de-bord'
  },{
    id: 2,
    name: 'Statistiques',
    iconName: 'statistic',
    pagePath: '/statistiques'
  },{
    id: 3,
    name: 'Réservations',
    iconName: 'booking',
    pagePath: '/réservations'
  },{
    id: 4,
    name: 'Activités',
    iconName: 'activity',
    pagePath: '/activités'
  },{
    id: 5,
    name: 'Promotions',
    iconName: 'discount',
    pagePath: '/promotions'
  },{
    id: 6,
    name: 'Avis',
    iconName: 'star',
    pagePath: '/avis'
  },{
    id: 7,
    name: 'Notification',
    iconName: 'notification',
    pagePath: '/notifications'
  },
];

  protected settingItemsData: ISidebarNavItem[] = [
  {
    id: 8,
    name: 'Paramètres',
    iconName: 'parameter',
    pagePath: '/paramètres'
  },{
    id: 9,
    name: 'Support',
    iconName: 'support',
    pagePath: '/support'
  },
];

  protected logout(): void {
    this.keycloakService.logout();
  }
}
