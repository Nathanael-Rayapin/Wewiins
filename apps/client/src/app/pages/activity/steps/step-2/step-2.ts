import { Component, computed, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonsValidations, ErrorPriorityType } from '../commons';
import { InputTextModule } from 'primeng/inputtext';
import { IScheduledActivity, IStepTwoForm } from './step-2.interface';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { automaticValidationOptions, childAllowedWithAdultOptions, dayOfWeekFullName, errorMessages } from './data/step-2.data';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { AddActivityDialog } from '../../../../components/add-schedule/add-schedule';
import { DatePipe } from '@angular/common';
import { ToastService } from '../../../../services/toast.service';
import { IftaLabelModule } from 'primeng/iftalabel';
import { TextareaModule } from 'primeng/textarea';
import { IconSvg } from '../../../../components/icon-svg/icon-svg';
import { toSignal } from '@angular/core/rxjs-interop';
import { TooltipModule } from 'primeng/tooltip';
import { StorageService } from '../../../../services/storage.service';
import { ActivityService } from '../../../../services/activity.service';
import { getMinutes } from '../../../../utils/date';
import { Subject } from 'rxjs';

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
    TooltipModule,
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
  private storageService = inject(StorageService);
  private activityService = inject(ActivityService);

  protected readonly errorPriority: ErrorPriorityType[] = ['required', 'min', 'max'];

  protected readonly errorMessages = errorMessages;

  public readonly onFormReady$ = new Subject<boolean>(); 

  override stepForm = this.fb.group({
    minCapacity: new FormControl<number | null>(null, [
      Validators.required, Validators.min(1), Validators.max(98)
    ]),
    maxCapacity: new FormControl<number | null>(null, [
      Validators.required, Validators.max(99)
    ]),
    slotDurationMin: new FormControl<number | null>(null, [
      Validators.required, Validators.min(5), Validators.max(1440)
    ]),
    minAge: new FormControl<number | null>(null, [
      Validators.required, Validators.min(1), Validators.max(98)
    ]),
    maxAge: new FormControl<number | null>(null, [
      Validators.max(99)
    ]),
    minAgeChild: new FormControl<number | null>(null, [
      Validators.min(3), Validators.max(14)
    ]),
    maxAgeChild: new FormControl<number | null>(null, [
      Validators.min(15), Validators.max(17)
    ]),
    refundPolicy: new FormControl<number | null>(null),
    automaticValidation: new FormControl<'Automatic' | 'Manual'>('Automatic', [
      Validators.required,
    ]),
    childAllowedWithAdult: new FormControl<'Yes' | 'No'>('Yes', [
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
    accessInfo: new FormControl<string | null>(null, [
      Validators.required
    ]),
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

  minAgeSignal = toSignal(this.stepForm.get('minAge')!.valueChanges,
    { initialValue: this.stepForm.get('minAge')!.value }
  );

  minForMax1 = computed(() => (this.minCapacitySignal() ?? 0) + 1);

  minForMax2 = computed(() => (this.minAgeSignal() ?? 0) + 1);

  ngOnInit(): void {
    this.patchFormWithExistingData();
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

  protected onScheduleAdded(data: IScheduledActivity): void {
    const conflictingDays = this.findConflictingDays(data);

    if (conflictingDays.length > 0) {
      this.toastService.error(`Conflit d'horaires détecté pour ${conflictingDays.join(', ')}. Les plages horaires se chevauchent.`);
      return;
    }

    const slotDurationMin = this.stepForm.controls.slotDurationMin.value;

    if (slotDurationMin && !this.isSlotDurationCompatible(data, slotDurationMin)) {
      this.toastService.error(
        `La durée des créneaux (${slotDurationMin} min) n'est pas compatible avec la plage horaire définie.`
      );
      return;
    }

    this.saveSchedule(data);
    this.isNewActivityDialogVisible = false;
  }

  private patchFormWithExistingData(): void {
    const stored = this.storageService.getActivityDraftStorage();
    const storedId = stored?.activityId;
    const storedName = stored?.step1?.name;

    if (!storedId && !storedName) {
      this.onFormReady$.next(false);
      return;
    };

    this.activityService.loadDraft(storedId, storedName).subscribe({
      next: (draft) => {
        if (!draft.step2) return;

        const step2 = draft.step2;

        this.stepForm.patchValue({
          ...step2,
          automaticValidation: step2.automaticValidation ? 'Automatic' : 'Manual',
          childAllowedWithAdult: step2.childAllowedWithAdult ? 'Yes' : 'No',
          scheduledActivities: step2.scheduledActivities?.map(s => ({
            ...s,
            id: s.id && s.id.trim() !== '' ? s.id : crypto.randomUUID(),
            dayOfWeek: s.dayOfWeek?.map(day => day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()) as dayOfWeekFullName[],
            openTime: s.openTime ? new Date(`1970-01-01T${s.openTime}Z`) : undefined,
            closeTime: s.closeTime ? new Date(`1970-01-01T${s.closeTime}Z`) : undefined,
            breakStart: s.breakStart ? new Date(`1970-01-01T${s.breakStart}Z`) : undefined,
            breakEnd: s.breakEnd ? new Date(`1970-01-01T${s.breakEnd}Z`) : undefined,
          })) ?? []
        });

        this.stepForm.updateValueAndValidity();
        this.onFormReady$.next(this.stepForm.valid);
      },
      error: (err) => console.error(err)
    });
  }

  private hasTimeOverlap(schedule1: IScheduledActivity, schedule2: IScheduledActivity): boolean {
    if (!schedule1.openTime || !schedule1.closeTime ||
      !schedule2.openTime || !schedule2.closeTime) {
      return false;
    }

    const commonDays = schedule1.dayOfWeek.filter(day =>
      schedule2.dayOfWeek.includes(day)
    );

    if (commonDays.length === 0) return false;

    const start1 = getMinutes(schedule1.openTime);
    const end1 = getMinutes(schedule1.closeTime);
    const start2 = getMinutes(schedule2.openTime);
    const end2 = getMinutes(schedule2.closeTime);

    return (start1 < end2) && (start2 < end1);
  }

  private findConflictingDays(data: IScheduledActivity): string[] {
    const existingSchedules = this.scheduledActivities.filter(s => s.id !== data.id);

    for (const existing of existingSchedules) {
      if (this.hasTimeOverlap(data, existing)) {
        return data.dayOfWeek.filter(day => existing.dayOfWeek.includes(day));
      }
    }

    return [];
  }

  private isSlotDurationCompatible(data: IScheduledActivity, slotDuration: number): boolean {
    if (!data.openTime || !data.closeTime) return true;

    const totalMinutes = getMinutes(data.closeTime) - getMinutes(data.openTime);
    const pauseMinutes = (data.breakStart && data.breakEnd)
      ? getMinutes(data.breakEnd) - getMinutes(data.breakStart)
      : 0;

    const activeMinutes = totalMinutes - pauseMinutes;

    return activeMinutes % slotDuration === 0;
  }

  private saveSchedule(data: IScheduledActivity): void {
    if (data.id) {
      this.scheduledActivities = this.scheduledActivities.map(s =>
        s.id === data.id ? { ...s, ...data } : s
      );
    } else {
      this.scheduledActivities = [
        ...this.scheduledActivities,
        { ...data, id: crypto.randomUUID() }
      ];
    }
  }
}
