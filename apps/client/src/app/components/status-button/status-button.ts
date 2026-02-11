import { Component, input } from '@angular/core';
import { IStatus } from '../../pipes/status.pipe';

@Component({
  selector: 'app-status-button',
  imports: [],
  templateUrl: './status-button.html',
  styleUrl: './status-button.css',
})
export class StatusButton {
  statusObj = input.required<IStatus>();
}
