import { Component, inject, signal, WritableSignal } from '@angular/core';
import { TitleSection } from '../../components/title-section/title-section';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Datepicker } from '../../components/datepicker/datepicker';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { IconSvg } from '../../components/icon-svg/icon-svg';
import { Trend } from '../../components/trend/trend';
import { ProgressBarModule } from 'primeng/progressbar';
import { ReviewService } from '../../services/review.service';
import { IActivityReviewDto, IReviewDto } from '../../dto/review';
import { defaultReviewData } from './data/review.data';
import { TableModule } from "primeng/table";
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';

@Component({
  selector: 'app-review',
  imports: [
    TitleSection,
    Datepicker,
    IconSvg,
    Trend,
    ProgressSpinnerModule,
    RatingModule,
    FormsModule,
    ProgressBarModule,
    TableModule,
    PaginatorModule,
    AutoCompleteModule,
  ],
  templateUrl: './review.html',
  styleUrl: './review.css',
})
export class Review {
  private reviewService = inject(ReviewService);

  isLoading = signal(false);
  startDate = signal<Date>(new Date());

  reviewData: WritableSignal<IReviewDto> = defaultReviewData;
  filterRangeDays = signal<number>(0);

  starsValue: number = 0;

  private originalActivities: IActivityReviewDto[] = [];

  get averageScore(): string {
    return `${this.reviewData().averageScore.currentValue
      .toLocaleString('fr-FR', { maximumFractionDigits: 2 })}/5`;
  }

  get totalVotes(): number {
    return this.reviewData().scoreDistribution.reduce((sum, v) => sum + v.count, 0);
  }

  ngOnInit(): void {
    this.initReview();
  }

  protected initReview(page: number = 1, pageSize: number = 10): void {
    this.isLoading.set(true);

    this.reviewService.initializeReview(
      this.startDate(), page, pageSize
    ).subscribe({
      next: (response) => {
        console.log("Response : ", response);

        this.reviewData.set(response);
        this.starsValue = response.averageScore.currentValue;
        this.filterRangeDays.set(response.filterRangeDays);
        this.originalActivities = response.activities.items;
      },
      error: (error: Error) => {
        console.error("Erreur lors du chargement de la page des avis", error.name);
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  protected getPercentage(count: number): number {
    if (this.totalVotes === 0) return 0;
    return (count / this.totalVotes) * 100;
  }

  // Filters
  searchValue: string | IActivityReviewDto = "";
  items: IActivityReviewDto[] = [];

  search(event: AutoCompleteCompleteEvent) {
    const query = (event.query ?? '').toLowerCase();
    const originalCopy = this.reviewData().activities.items;

    this.items = query.length === 0
      ? originalCopy
      : originalCopy.filter(item =>
        item.activityName.toLowerCase().includes(query)
      );
  }

  onActivitySelect(event: AutoCompleteSelectEvent): void {
    const activity = event.value as IActivityReviewDto;

    const filtered = this.reviewData().activities.items.filter(
      item => item.activityId === activity.activityId
    );

    this.reviewData.update(current => ({
      ...current,
      activities: {
        ...current.activities,
        items: filtered
      }
    }));
  }

  onSearchClear(): void {
    console.log("STEP 3 : Passed");
    this.reviewData.update(current => ({
      ...current,
      activities: { ...current.activities, items: this.originalActivities }
    }));
  }

  // Paginator
  first = signal<number>(0);
  rows = signal<number>(10);

  onPageChange(event: PaginatorState): void {
    const page = Math.floor(event.first! / event.rows!) + 1;

    this.first.set(event.first!);
    this.rows.set(event.rows!);

    this.initReview(page, event.rows!);
  }
}
