import { Component, input } from '@angular/core';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';

@Component({
  selector: 'app-photo-badge',
  imports: [CapitalizePipe],
  templateUrl: './photo-badge.html',
  styleUrl: './photo-badge.css',
})
export class PhotoBadge {
  badgeType = input.required<"main" | "secondary">();
}
