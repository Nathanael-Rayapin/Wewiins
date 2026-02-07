import { Component } from '@angular/core';
import { ListboxModule } from 'primeng/listbox';
import { ISidebarNavItem } from '../sidebar/sidebar.interface';

@Component({
  selector: 'app-burger-menu',
  imports: [ListboxModule],
  templateUrl: './burger-menu.html',
  styleUrl: './burger-menu.css',
})
export class BurgerMenu {
  cities: Pick<ISidebarNavItem, 'name'>[] = [
    { name: 'Tableau de bord' },
    { name: 'Statistiques' },
    { name: 'Réservations' },
    { name: 'Activités' },
    { name: 'Promotions' },
    { name: 'Avis' },
    { name: 'Notification' },
    { name: 'Paramètres' },
    { name: 'Support' },
    { name: 'Déconnexion' }
  ];
}
