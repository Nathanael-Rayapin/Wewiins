import { Component } from '@angular/core';
import { TitleSection } from '../../components/title-section/title-section';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-activity',
  imports: [
    TitleSection,
    
    RouterOutlet
],
  templateUrl: './activity.html',
  styleUrl: './activity.css',
})
export class Activity {}
