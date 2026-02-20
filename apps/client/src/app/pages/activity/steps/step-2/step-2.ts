import { Component, computed, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonsValidations, ErrorPriorityType } from '../commons';
import { InputTextModule } from 'primeng/inputtext';
import { IScheduledActivity, IStepTwo, IStepTwoForm } from './step-2.interface';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { automaticValidationOptions, AvailabilityDayFullName, availabilityDays, childAllowedWithAdultOptions, errorMessages } from './data/step-2.data';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { AddActivityDialog } from '../../../../components/add-activity-dialog/add-activity-dialog';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../../../services/toast.service';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TextareaModule } from 'primeng/textarea';
import { IconSvg } from '../../../../components/icon-svg/icon-svg';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-step-2',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    FormsModule,
    InputNumberModule,
    SelectModule,
    DialogModule,
    ButtonModule,
    DatePickerModule,
    IftaLabelModule,
    TextareaModule,
    DatePipe,
    AddActivityDialog,
    IconSvg
  ],
  templateUrl: './step-2.html',
  styleUrl: './step-2.css',
  encapsulation: ViewEncapsulation.None,
})
export class Step2 extends CommonsValidations<IStepTwoForm> implements OnInit {
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  protected readonly errorPriority: ErrorPriorityType[] = ['required', 'min', 'max'];

  protected readonly errorMessages = errorMessages;

  override stepForm = this.fb.group({
    minCapacity: new FormControl<number | null>(null, [
      Validators.required, Validators.min(1), Validators.max(98)
    ]),
    maxCapacity: new FormControl<number | null>(null, [
      Validators.required, Validators.max(99)
    ]),
    slotDuration: new FormControl<number | null>(null, [
      Validators.required, Validators.min(30), Validators.max(1440)
    ]),
    minAge: new FormControl<number | null>(null, [
      Validators.required, Validators.min(1), Validators.max(98)
    ]),
    maxAge: new FormControl<number | null>(null, [
      Validators.required, Validators.max(99)
    ]),
    maxAgeChild: new FormControl<number | null>(null, [
      Validators.min(3), Validators.max(17)
    ]),
    automaticValidation: new FormControl<'Automatic' | 'Manual' | null>(null, [
      Validators.required,
    ]),
    childAllowedWithAdult: new FormControl<'Yes' | 'No' | null>(null, [
      Validators.required,
    ]),
    address: new FormControl<string | null>(null, [
      Validators.required,
    ]),
    zipcode: new FormControl<string | null>(null, [
      Validators.required, Validators.pattern(/^\d{5}$/)
    ]),
    city: new FormControl<string | null>(null, [
      Validators.required,
    ]),
    accessInfo: new FormControl<string | null>(null),
    scheduledActivities: new FormControl<IScheduledActivity[]>([], {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1)]
    })
  });

  autoValidationOpts = automaticValidationOptions;
  childWithAdultOpts = childAllowedWithAdultOptions;

  protected isNewActivityDialogVisible = false;
  protected editingScheduleId = signal<string | null>(null);

  get scheduledActivities() {
    return this.stepForm.controls.scheduledActivities.value ?? [];
  }

  set scheduledActivities(value: IScheduledActivity[]) {
    this.stepForm.controls.scheduledActivities.setValue(value);
  }

  /**
   * Avoids ExpressionChangedAfterItHasBeenCheckedError: the inline expression of the template
   * changed during the detection cycle (button held down → rapid updates).
   * We use a signal + computed to guarantee a stable value during the CD.
   */
  minCapacitySignal = toSignal(this.stepForm.get('minCapacity')!.valueChanges,
    { initialValue: this.stepForm.get('minCapacity')!.value }
  );

  minForMax1 = computed(() => (this.minCapacitySignal() ?? 0) + 1);

  minAgeSignal = toSignal(this.stepForm.get('minAge')!.valueChanges,
    { initialValue: this.stepForm.get('minAge')!.value }
  );

  minForMax2 = computed(() => (this.minAgeSignal() ?? 0) + 1);


  ngOnInit(): void {
    this.patchFormWithExistingData();
  }

  private patchFormWithExistingData(): void {
    const data = localStorage.getItem('activityData');

    if (data) {
      const formValues: IStepTwo = JSON.parse(data);

      this.stepForm.patchValue({
        minCapacity: formValues.minCapacity,
        maxCapacity: formValues.maxCapacity,
        slotDuration: formValues.slotDuration,
        minAge: formValues.minAge,
        maxAge: formValues.maxAge,
        maxAgeChild: formValues.maxAgeChild,
        automaticValidation: formValues.automaticValidation,
        childAllowedWithAdult: formValues.childAllowedWithAdult,
        address: formValues.address,
        zipcode: formValues.zipcode,
        city: formValues.city,
        accessInfo: formValues.accessInfo,
      });

      this.stepForm.updateValueAndValidity();
    }
  }

  protected openDialogForCreation(): void {
    this.editingScheduleId.set(null);
    this.isNewActivityDialogVisible = true;
  }

  protected openDialogForEdit(id: string): void {
    this.editingScheduleId.set(id);
    this.isNewActivityDialogVisible = true;
  }

  protected getScheduleData(id: string | null): IScheduledActivity | undefined {
    if (id === null) return undefined;
    return this.scheduledActivities.find(s => s.id === id);
  }

  private hasTimeOverlap(schedule1: IScheduledActivity, schedule2: IScheduledActivity): boolean {
    const commonDays = schedule1.selectedDays.filter(day =>
      schedule2.selectedDays.includes(day)
    );

    if (commonDays.length === 0) {
      return false;
    }

    const getMinutes = (date: Date): number => {
      return date.getHours() * 60 + date.getMinutes();
    };

    const start1 = getMinutes(schedule1.availabilityFrom);
    const end1 = getMinutes(schedule1.availabilityTo);
    const start2 = getMinutes(schedule2.availabilityFrom);
    const end2 = getMinutes(schedule2.availabilityTo);

    return (start1 < end2) && (start2 < end1);
  }

  protected onScheduleAdded(data: IScheduledActivity): void {
    const existingSchedules = this.scheduledActivities.filter(s => s.id !== data.id);

    for (const existing of existingSchedules) {
      if (this.hasTimeOverlap(data, existing)) {
        const commonDays = data.selectedDays.filter(day =>
          existing.selectedDays.includes(day)
        );

        this.toastService.error(
          `Conflit d'horaires détecté pour ${commonDays.join(', ')}. Les plages horaires se chevauchent.`
        );

        return;
      }
    }

    if (data.id) {
      const updatedActivities = this.scheduledActivities.map(activity =>
        activity.id === data.id
          ? { ...activity, ...data }
          : activity
      );
      this.scheduledActivities = updatedActivities;
    } else {
      const newSchedule: IScheduledActivity = {
        id: crypto.randomUUID(),
        selectedDays: data.selectedDays,
        availabilityFrom: data.availabilityFrom,
        availabilityTo: data.availabilityTo,
        unavailabilityFrom: data.unavailabilityFrom,
        unavailabilityTo: data.unavailabilityTo,
      };
      this.scheduledActivities = [...this.scheduledActivities, newSchedule];
    }

    this.isNewActivityDialogVisible = false;
  }
}
