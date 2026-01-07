import { Component, input, signal } from '@angular/core';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-button',
  imports: [NgOptimizedImage],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class Button {
  textContent = input.required<string>();
  iconPath = input.required<string>();
  colorButton = input.required<string>();
  darkColorButon = input.required<string>();
  buttonType = input<'submit' | 'reset' | 'button'>('button');

  isHovered = signal(false);
}
