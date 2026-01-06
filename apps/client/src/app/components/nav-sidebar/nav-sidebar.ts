import { Component, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ISidebarNavItem } from '../sidebar/sidebar.interface';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-sidebar',
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive],
  templateUrl: './nav-sidebar.html',
  styleUrl: './nav-sidebar.css',
})
export class NavSidebar {
  item = input.required<ISidebarNavItem>();
  isHovered = signal(false);
}
