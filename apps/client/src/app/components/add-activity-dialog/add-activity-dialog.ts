import { ChangeDetectionStrategy, Component, effect, input, model, output, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { AvailabilityDayCode, availabilityDays } from '../../pages/activity/steps/step-2/data/step-2.data';
import { getMinutesFromDate, isTimeRangeWithin, validateTimeRange } from '../../utils/date';
import { IScheduledActivity } from '../../pages/activity/steps/step-2/step-2.interface';

@Component({
  selector: 'app-add-activity-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    DatePickerModule
  ],
  templateUrl: './add-activity-dialog.html',
  styleUrl: './add-activity-dialog.css',
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
  initialSelectedDays = input<AvailabilityDayCode[]>([]);

  // [Outputs Events]
  scheduleAdded = output<IScheduledActivity>();
  cancelled = output<void>();

  // [Internal State]
  availabilityDays = availabilityDays;
  availabilityFrom = signal<Date | undefined>(undefined);
  availabilityTo = signal<Date | undefined>(undefined);
  unavailabilityFrom = signal<Date | undefined>(undefined);
  unavailabilityTo = signal<Date | undefined>(undefined);
  selectedDays = signal<AvailabilityDayCode[]>([]);

  // [Errors State]
  availabilityToError = signal<string | null>(null);
  unavailabilityFromError = signal<string | null>(null);
  unavailabilityToError = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (this.editingScheduleId() === null && this.visible()) {
        this.availabilityFrom.set(undefined);
        this.availabilityTo.set(undefined);
        this.unavailabilityFrom.set(undefined);
        this.unavailabilityTo.set(undefined);
        this.selectedDays.set([]);
      }
    });

    effect(() => {
      if (this.editingScheduleId() !== null) {
        this.availabilityFrom.set(this.initialAvailabilityFrom());
        this.availabilityTo.set(this.initialAvailabilityTo());
        this.unavailabilityFrom.set(this.initialUnavailabilityFrom());
        this.unavailabilityTo.set(this.initialUnavailabilityTo());
        this.selectedDays.set(this.initialSelectedDays());
      }
    });

    effect(() => {
      validateTimeRange(this.availabilityFrom(), this.availabilityTo(), this.availabilityToError);
      this.validateUnavailability();
    });
  }

  protected addToSelectedDays(code: AvailabilityDayCode): void {
    const currentDays = [...this.selectedDays()];
    const existingIndex = currentDays.findIndex(c => c === code);

    if (existingIndex !== -1) {
      currentDays.splice(existingIndex, 1);
    } else {
      currentDays.push(code);
    }

    this.selectedDays.set(currentDays);
  }

  protected validateUnavailability(): void {
    const innerRangeLabel = 'L\'indisponibilité';
    const outerRangeLabel = 'les horaires de disponibilité';
    const checkSpace = true;

    const innerFromMin = getMinutesFromDate(this.unavailabilityFrom());
    const innerToMin = getMinutesFromDate(this.unavailabilityTo());
    const outerFromMin = getMinutesFromDate(this.availabilityFrom());
    const outerToMin = getMinutesFromDate(this.availabilityTo());

    this.unavailabilityFromError.set(null);
    this.unavailabilityToError.set(null);

    // If the internal range is not defined, no validation
    if (innerFromMin === null && innerToMin === null) {
      return;
    }

    // Validate that innerTo > innerFrom
    validateTimeRange(this.unavailabilityFrom(), this.unavailabilityTo(), this.unavailabilityToError);

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
      && this.availabilityFrom() !== undefined
      && this.availabilityTo() !== undefined
      && this.selectedDays().length > 0;
  }

  protected onAddSchedule(): void {
    if (!this.canAddSchedule()) return;

    this.scheduleAdded.emit({
      id: this.editingScheduleId() ?? undefined,
      selectedDays: this.selectedDays(),
      availabilityFrom: this.availabilityFrom()!,
      availabilityTo: this.availabilityTo()!,
      unavailabilityFrom: this.unavailabilityFrom(),
      unavailabilityTo: this.unavailabilityTo(),
    });
    this.visible.set(false);
  }

  protected onCancel(): void {
    this.visible.set(false);
    this.cancelled.emit();
  }
}