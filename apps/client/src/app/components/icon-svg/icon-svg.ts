import { Component, input } from '@angular/core';

@Component({
  selector: 'app-icon-svg',
  imports: [],
  templateUrl: './icon-svg.html',
  styleUrl: './icon-svg.css',
})
export class IconSvg {
  iconName = input.required<string>();
  width = input.required<string>();
  height = input.required<string>();
  color = input.required<string>();
}