import { Component, input, signal } from '@angular/core';
import { ISidebarNavItem } from '../sidebar/sidebar.interface';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IconSvg } from '../icon-svg/icon-svg';

@Component({
  selector: 'app-nav-sidebar',
  imports: [RouterLink, RouterLinkActive, IconSvg],
  templateUrl: './nav-sidebar.html',
  styleUrl: './nav-sidebar.css',
})
export class NavSidebar {
  item = input.required<ISidebarNavItem>();
  isHovered = signal(false);
}
