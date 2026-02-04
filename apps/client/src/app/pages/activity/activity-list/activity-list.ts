import { Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { NgOptimizedImage } from '@angular/common';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-activity-list',
  imports: [
    ProgressSpinnerModule,
    FormsModule,
    AutoCompleteModule,
    NgOptimizedImage,
  ],
  templateUrl: './activity-list.html',
  styleUrl: './activity-list.css',
  encapsulation: ViewEncapsulation.None,
})
export class ActivityList {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = signal(false);

  // TODO: Update types when retrieving data from API
  items: any[] = [];
  value: any;

  activityData = [];

  // TODO: Update method when retrieving data from API
  search(event: AutoCompleteCompleteEvent) {
    console.log('Event : ', event);
  }

  addNewActivity(): void {
    this.router.navigate(['nouvelle'], { relativeTo: this.route });
  }
}
