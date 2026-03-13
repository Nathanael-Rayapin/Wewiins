import { ChangeDetectionStrategy, Component, effect, input, model, output, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { dayOfWeekFullName, availabilityDays } from '../../pages/activity/steps/step-2/data/step-2.data';
import { getMinutesFromDate, isTimeRangeWithin, validateTimeRange } from '../../utils/date';
import { IScheduledActivity } from '../../pages/activity/steps/step-2/step-2.interface';

@Component({
  selector: 'app-add-schedule',
  imports: [
    DialogModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    DatePickerModule
  ],
  templateUrl: './add-schedule.html',
  styleUrl: './add-schedule.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AddActivityDialog {
  visible = model<boolean>(false);

  // [Inputs Signals]
  editingScheduleId = input<string | null>(null);

  initialAvailabilityFrom = input<Date | undefined>(undefined);
  initialAvailabilityTo = input<Date | undefined>(undefined);
  initialUnavailabilityFrom = input<Date | undefined>(undefined);
  initialUnavailabilityTo = input<Date | undefined>(undefined);
  initialSelectedDays = input<dayOfWeekFullName[]>([]);

  // [Outputs Events]
  scheduleAdded = output<IScheduledActivity>();
  cancelled = output<void>();

  // [Internal State]
  availabilityDays = availabilityDays;
  openTime = signal<Date | undefined>(undefined);
  closeTime = signal<Date | undefined>(undefined);
  breakStart = signal<Date | undefined>(undefined);
  breakEnd = signal<Date | undefined>(undefined);
  dayOfWeek = signal<dayOfWeekFullName[]>([]);

  // [Errors State]
  availabilityToError = signal<string | null>(null);
  unavailabilityFromError = signal<string | null>(null);
  unavailabilityToError = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.editingScheduleId() === null && this.visible()) {
        this.openTime.set(undefined);
        this.closeTime.set(undefined);
        this.breakStart.set(undefined);
        this.breakEnd.set(undefined);
        this.dayOfWeek.set([]);
      }
    });

    effect(() => {
      if (this.editingScheduleId() !== null) {
        this.openTime.set(this.initialAvailabilityFrom());
        this.closeTime.set(this.initialAvailabilityTo());
        this.breakStart.set(this.initialUnavailabilityFrom());
        this.breakEnd.set(this.initialUnavailabilityTo());
        this.dayOfWeek.set(this.initialSelectedDays());
      }
    });

    effect(() => {
      validateTimeRange(this.openTime(), this.closeTime(), this.availabilityToError);
      this.validateUnavailability();
    });
  }

  protected addToSelectedDays(code: dayOfWeekFullName): void {
    const currentDays = [...this.dayOfWeek()];
    const existingIndex = currentDays.findIndex(c => c === code);

    if (existingIndex !== -1) {
      currentDays.splice(existingIndex, 1);
    } else {
      currentDays.push(code);
    }

    this.dayOfWeek.set(currentDays);
  }

  protected validateUnavailability(): void {
    const innerRangeLabel = 'L\'indisponibilité';
    const outerRangeLabel = 'les horaires de disponibilité';
    const checkSpace = true;

    const innerFromMin = getMinutesFromDate(this.breakStart());
    const innerToMin = getMinutesFromDate(this.breakEnd());
    const outerFromMin = getMinutesFromDate(this.openTime());
    const outerToMin = getMinutesFromDate(this.closeTime());

    this.unavailabilityFromError.set(null);
    this.unavailabilityToError.set(null);

    // If the internal range is not defined, no validation
    if (innerFromMin === null && innerToMin === null) {
      return;
    }

    // Validate that innerTo > innerFrom
    validateTimeRange(this.breakStart(), this.breakEnd(), this.unavailabilityToError);

    // If the external range is not defined, stop here.
    if (outerFromMin === null || outerToMin === null) {
      return;
    }

    // Verify that innerFrom is greater than or equal to outerFrom
    if (innerFromMin !== null && innerFromMin < outerFromMin) {
      this.unavailabilityFromError.set(`${innerRangeLabel} doit être comprise dans ${outerRangeLabel}`);
      return;
    }

    // Verify that innerTo <= outerTo
    if (innerToMin !== null && innerToMin > outerToMin) {
      this.unavailabilityToError.set(`${innerRangeLabel} doit être comprise dans ${outerRangeLabel}`);
      return;
    }

    // Check with isTimeRangeWithin (redundant but retained for compatibility)
    const validation = isTimeRangeWithin(innerFromMin, innerToMin, outerFromMin, outerToMin);

    if (!validation.fromValid) {
      this.unavailabilityFromError.set(`${innerRangeLabel} doit être comprise dans ${outerRangeLabel}`);
      return;
    }

    if (!validation.toValid) {
      this.unavailabilityToError.set(`${innerRangeLabel} doit être comprise dans ${outerRangeLabel}`);
      return;
    }

    // Check that there is enough space (optional)
    if (checkSpace && !validation.hasSpace && innerFromMin !== null && innerToMin !== null) {
      this.unavailabilityFromError.set('La plage de disponibilité est trop courte pour une pause');
    }
  }

  protected canAddSchedule(): boolean {
    return this.availabilityToError() === null
      && this.unavailabilityFromError() === null
      && this.unavailabilityToError() === null
      && this.openTime() !== null
      && this.closeTime() !== null
      && this.dayOfWeek().length > 0;
  }

  protected onAddSchedule(): void {
    if (!this.canAddSchedule()) return;

    this.scheduleAdded.emit({
      id: this.editingScheduleId() ?? undefined,
      dayOfWeek: this.dayOfWeek(),
      openTime: this.openTime()!,
      closeTime: this.closeTime()!,
      breakStart: this.breakStart(),
      breakEnd: this.breakEnd(),
    });
    this.visible.set(false);
  }

  protected onCancel(): void {
    this.visible.set(false);
    this.cancelled.emit();
  }
}