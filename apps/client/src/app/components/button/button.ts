import { Component, input, signal } from '@angular/core';
import { IconSvg } from '../icon-svg/icon-svg';

@Component({
  selector: 'app-button',
  imports: [IconSvg],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  textContent = input.required<string>();
  iconName = input.required<string>();
  colorIcon = input.required<string>();
  colorButton = input.required<string>();
  hoverColorButton = input.required<string>();
  buttonType = input<'submit' | 'reset' | 'button'>('button');

  isHovered = signal(false);
}
