import { Component, effect, inject, input, signal } from '@angular/core';
import { Button } from '../button/button';
import { BurgerMenu } from '../burger-menu/burger-menu';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconSvg } from '../icon-svg/icon-svg';

@Component({
  selector: 'app-title-section',
  imports: [Button, BurgerMenu, IconSvg],
  templateUrl: './title-section.html',
  styleUrl: './title-section.css',
})
export class TitleSection {
  private breakpointObserver = inject(BreakpointObserver);
  title = input.required<string>();

  isNotificationHovered = signal(false);
  isMenuHovered = signal(false);
  isMenuDisplayed = signal(false);

  isTablet$ = toSignal(
    this.breakpointObserver
      .observe(['(min-width: 640px)'])
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

  constructor() {
    effect(() => {
      if (this.isTablet$() && this.isMenuDisplayed()) {
        this.isMenuDisplayed.set(false);
      }
    });
  }
}
