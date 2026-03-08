import { Component, DestroyRef, inject, OnInit, signal, ViewEncapsulation, WritableSignal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CommonsValidations, ErrorPriorityType } from '../commons';
import { IDayPricing, IDayPricingForm, IDaySchedule, IRateFields, ISimplePricingForm, IStepFour, IVariablePricingForm, MOMENT_LABELS, MomentCode } from './step-4.interface';
import { errorMessages } from './data/step-4.data';
import { IScheduledActivity } from '../step-2/step-2.interface';
import { dayOfWeekFullName } from '../step-2/data/step-2.data';
import { buildDaySchedules } from '../../../../utils/date';
import { InputNumberModule } from 'primeng/inputnumber';
import { debounceTime, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isValueExist } from '../../../../utils/string';
import { SelectButtonChangeEvent, SelectButtonModule } from 'primeng/selectbutton';
import { StorageService } from '../../../../services/storage.service';
import { ActivityService } from '../../../../services/activity.service';

@Component({
  selector: 'app-step-4',
  imports: [ToggleSwitchModule, FormsModule, ReactiveFormsModule, InputNumberModule, SelectButtonModule],
  templateUrl: './step-4.html',
  styleUrl: './step-4.css',
  encapsulation: ViewEncapsulation.None,
})
export class Step4 extends CommonsValidations<ISimplePricingForm, IVariablePricingForm> implements OnInit {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private storageService = inject(StorageService);
  private activityService = inject(ActivityService);

  override stepForm: FormGroup<ISimplePricingForm> = this.createSimplePricingForm();
  override stepFormForVariableRate: FormGroup<IVariablePricingForm> | undefined = undefined;

  protected override readonly errorPriority: ErrorPriorityType[] = ['required', 'min'];
  protected override readonly errorMessages = errorMessages;

  readonly daySchedules = signal<IDaySchedule[]>([]);
  readonly isPriceReadOnly = signal(false);
  readonly isPriceModelHasChanged = signal(false);

  private momentReadOnlyStates = new Map<string, WritableSignal<boolean>>();

  // Switches for simple form
  readonly switchVariablePricing = new FormControl(false, { nonNullable: true });
  readonly switchSingleRate = new FormControl({ value: false, disabled: true },);
  readonly switchAdultRate = new FormControl(true, { nonNullable: true });
  readonly switchStudentRate = new FormControl(true, { nonNullable: true });
  readonly switchChildRate = new FormControl(true, { nonNullable: true });
  readonly switchTwoPersonGroup = new FormControl(true, { nonNullable: true });

  readonly selectedDayControl = new FormControl<dayOfWeekFullName | null>(null);
  readonly selectedMomentControl = new FormControl<MomentCode | null>(null);

  public readonly onFormReady$ = new Subject<boolean>(); 

  private modeReady$ = new Subject<boolean>();
  readonly onModeReady$ = this.modeReady$.asObservable();

  // Switches for variable form
  private daySwitches = new Map<dayOfWeekFullName, FormControl<boolean>>();
  private momentSwitches = new Map<string, {
    singleRate: FormControl<boolean>;
    adult: FormControl<boolean>;
    child: FormControl<boolean>;
    student: FormControl<boolean>;
    twoPersonGroup: FormControl<boolean>;
  }>();

  ngOnInit(): void {
    this.patchFormWithExistingData();
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
        if (draft.step2?.scheduledActivities) {
          this.buildDaySchedulesFromDraft(draft.step2.scheduledActivities);
        }

        const step4 = draft.step4;

        if (!step4) {
          this.watchSingleRateForSwitchState();
          this.modeReady$.next(false);
          this.onFormReady$.next(this.stepForm.valid);
          return;
        }

        if (step4.isVariablePricing) {
          this.switchVariablePricing.setValue(true, { emitEvent: false });
          this.isPriceModelHasChanged.set(true);
          this.initVariableForm();
          this.patchVariableForm(step4);
          this.modeReady$.next(true);
           this.onFormReady$.next(this.stepFormForVariableRate?.valid ?? false);
        } else {
          this.watchSingleRateForSwitchState();
          this.patchSimpleForm(step4.simplePricing);
          this.modeReady$.next(false);
          this.onFormReady$.next(this.stepForm.valid);
        }
      },
      error: (err) => console.error(err)
    });
  }

  private patchSimpleForm(simplePricing: IStepFour['simplePricing']): void {
    if (!simplePricing) return;

    this.stepForm.patchValue({
      singleRate: simplePricing.singleRate,
      adultRate: simplePricing.adultRate,
      childRate: simplePricing.childRate,
      studentRate: simplePricing.studentRate,
      twoPersonGroupRate: simplePricing.twoPersonGroupRate,
    });

    // Restauration des switches
    this.switchAdultRate.setValue(simplePricing.isAdultEnabled);
    this.switchChildRate.setValue(simplePricing.isChildEnabled);
    this.switchStudentRate.setValue(simplePricing.isStudentEnabled);
    this.switchTwoPersonGroup.setValue(simplePricing.isGroup2Enabled);

    // Restauration du singleRate switch
    if (simplePricing.singleRate != null) {
      this.switchSingleRate.enable();
      // On déduit si le singleRate était actif : si tous les prix activés sont égaux au singleRate
      const activePrices = [
        simplePricing.isAdultEnabled ? simplePricing.adultRate : null,
        simplePricing.isChildEnabled ? simplePricing.childRate : null,
        simplePricing.isStudentEnabled ? simplePricing.studentRate : null,
        simplePricing.isGroup2Enabled ? simplePricing.twoPersonGroupRate : null,
      ].filter(p => p !== null);

      const isSingleRateActive = activePrices.every(p => p === simplePricing.singleRate);
      this.switchSingleRate.setValue(isSingleRateActive);
      if (isSingleRateActive) this.onToggleAllRates(true);
    }

    this.stepForm.updateValueAndValidity();
  }

  private patchVariableForm(step4: IStepFour): void {
    if (!this.stepFormForVariableRate || !step4.variablePricing?.dayPricings) return;

    step4.variablePricing.dayPricings.forEach(dayPricing => {
      const group = this.dayPricings.controls.find(g =>
        g.controls.day.value === dayPricing.day &&
        g.controls.selectedMoment.value === dayPricing.selectedMoment
      );

      if (!group) return;

      group.patchValue({
        singleRate: dayPricing.singleRate,
        adultRate: dayPricing.adultRate,
        childRate: dayPricing.childRate,
        studentRate: dayPricing.studentRate,
        twoPersonGroupRate: dayPricing.twoPersonGroupRate,
      });

      this.restoreMomentSwitches(dayPricing, group);
    });

    this.stepFormForVariableRate.updateValueAndValidity();
  }

  private restoreMomentSwitches(dayPricing: IDayPricing, group: FormGroup<IDayPricingForm>): void {
    const switches = this.getMomentSwitches(dayPricing.day!, dayPricing.selectedMoment);

    switches.adult.setValue(dayPricing.isAdultEnabled ?? true);
    switches.child.setValue(dayPricing.isChildEnabled ?? true);
    switches.student.setValue(dayPricing.isStudentEnabled ?? true);
    switches.twoPersonGroup.setValue(dayPricing.isGroup2Enabled ?? true);

    if (dayPricing.singleRate == null) return;

    switches.singleRate.enable();

    const activePrices = [
      dayPricing.isAdultEnabled ? dayPricing.adultRate : null,
      dayPricing.isChildEnabled ? dayPricing.childRate : null,
      dayPricing.isStudentEnabled ? dayPricing.studentRate : null,
      dayPricing.isGroup2Enabled ? dayPricing.twoPersonGroupRate : null,
    ].filter((p): p is number => p !== null);

    const isSingleRateActive = activePrices.every(p => p === dayPricing.singleRate);
    switches.singleRate.setValue(isSingleRateActive);

    if (isSingleRateActive) {
      this.getMomentReadOnly(dayPricing.day!, dayPricing.selectedMoment).set(true);
      this.disableRateControls([
        { control: group.controls.adultRate },
        { control: group.controls.childRate },
        { control: group.controls.studentRate },
        { control: group.controls.twoPersonGroupRate },
      ]);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Simple Pricing Mode
  // ─────────────────────────────────────────────────────────────────────────
  private createSimplePricingForm(): FormGroup<ISimplePricingForm> {
    return this.fb.group<ISimplePricingForm>({
      singleRate: this.fb.control(null,),
      adultRate: this.fb.control(null, [Validators.required]),
      childRate: this.fb.control(null, [Validators.required]),
      studentRate: this.fb.control(null, [Validators.required]),
      twoPersonGroupRate: this.fb.control(null, [Validators.required])
    });
  }

  private watchSingleRateForSwitchState(): void {
    this.stepForm.controls.singleRate.valueChanges
      .pipe(debounceTime(500), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (isValueExist(value)) {
          this.switchSingleRate.enable();
        } else {
          this.switchSingleRate.patchValue(false, { emitEvent: false });
          this.switchSingleRate.disable();
        }
      });

    this.watchSingleRateForFieldSync()
  }

  private watchSingleRateForFieldSync(): void {
    this.stepForm.controls.singleRate.valueChanges
      .pipe(debounceTime(500), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        if (!this.switchSingleRate.value) return;

        const controlSwitchMap = [
          { control: this.stepForm.controls.adultRate, switch: this.switchAdultRate },
          { control: this.stepForm.controls.childRate, switch: this.switchChildRate },
          { control: this.stepForm.controls.studentRate, switch: this.switchStudentRate },
          { control: this.stepForm.controls.twoPersonGroupRate, switch: this.switchTwoPersonGroup },
        ];

        controlSwitchMap.forEach(({ control, switch: sw }) => {
          if (sw.value) control.patchValue(value, { emitEvent: false });
        });
      });
  }

  onToggleAllRates(checked: boolean): void {
    const controlSwitchMap = [
      { control: this.stepForm.controls.adultRate, switch: this.switchAdultRate },
      { control: this.stepForm.controls.childRate, switch: this.switchChildRate },
      { control: this.stepForm.controls.studentRate, switch: this.switchStudentRate },
      { control: this.stepForm.controls.twoPersonGroupRate, switch: this.switchTwoPersonGroup }
    ];

    if (checked) {
      this.syncRatesWithSingleRate(controlSwitchMap);
      this.disableRateControls(controlSwitchMap);
    } else {
      this.enableRateControls(controlSwitchMap);
    }

    this.isPriceReadOnly.set(checked);
  }

  private syncRatesWithSingleRate(controlSwitchMap: Array<{ control: any; switch: FormControl<boolean> }>): void {
    const singleRate = this.stepForm.controls.singleRate.value;

    controlSwitchMap.forEach(({ control, switch: sw }) => {
      if (sw.value) {
        control.patchValue(singleRate)
      };
    });
  }

  private disableRateControls(controlSwitchMap: Array<{ control: any }>): void {
    controlSwitchMap.forEach(({ control }) => control.disable());
  }

  private enableRateControls(controlSwitchMap: Array<{ control: any }>): void {
    controlSwitchMap.forEach(({ control }) => control.enable());
  }

  onToggleRate(checked: boolean, rateField: keyof IRateFields): void {
    const control = this.stepForm.get(rateField);
    if (!control) return;

    const singleRate = this.stepForm.controls.singleRate.value;

    if (checked && this.isPriceReadOnly()) {
      control.patchValue(singleRate);
      control.disable();
    }

    if (checked && !this.isPriceReadOnly()) {
      control.enable();
    }

    if (!checked) {
      control.patchValue(null);
      control.reset();
      control.disable();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Variable Pricing Mode
  // ─────────────────────────────────────────────────────────────────────────
  get currentMomentGroup(): FormGroup<IDayPricingForm> | undefined {
    const day = this.selectedDayControl.value;
    const moment = this.selectedMomentControl.value;

    if (!day || !moment || !this.stepFormForVariableRate) return undefined;

    return this.dayPricings.controls.find(
      group => group.controls.day.value === day && group.controls.selectedMoment.value === moment
    );
  }

  get dayPricings(): FormArray<FormGroup<IDayPricingForm>> {
    return this.stepFormForVariableRate!.controls.dayPricings;
  }

  public getMomentSwitches(day: dayOfWeekFullName, moment: MomentCode) {
    const key = `${day}-${moment}`;

    if (!this.momentSwitches.has(key)) {
      this.momentSwitches.set(key, {
        singleRate: new FormControl({ value: false, disabled: true }, { nonNullable: true }),
        adult: new FormControl(true, { nonNullable: true }),
        child: new FormControl(true, { nonNullable: true }),
        student: new FormControl(true, { nonNullable: true }),
        twoPersonGroup: new FormControl(true, { nonNullable: true })
      });

      this.watchMomentSingleRateForSwitchState(day, moment);
    }

    return this.momentSwitches.get(key)!;
  }

  protected getUniqueDays(): dayOfWeekFullName[] {
    if (!this.stepFormForVariableRate) return [];

    const days = this.dayPricings.controls
      .map(group => group.controls.day.value)
      .filter((day): day is dayOfWeekFullName => day !== null);

    return [...new Set(days)];
  }

  protected onDayChange(event: SelectButtonChangeEvent): void {
    this.selectedDayControl.setValue(event.value);
    const firstMoment = this.getMomentOptionsForSelectedDay()[0]?.value;
    if (firstMoment) this.selectedMomentControl.setValue(firstMoment);
  }

  protected getDayPricingGroupsForDay(day: dayOfWeekFullName): FormGroup<IDayPricingForm>[] {
    return this.dayPricings.controls.filter(group => group.controls.day.value === day);
  }

  protected getMomentOptionsForSelectedDay(): Array<{ label: string; value: MomentCode }> {
    const selectedDay = this.selectedDayControl.value;
    if (!selectedDay) return [];

    const daySchedule = this.daySchedules().find(ds => ds.day === selectedDay);
    if (!daySchedule) return [];

    return daySchedule.availableMoments
      .filter(m => m !== 'ALL')
      .map(moment => ({ label: MOMENT_LABELS[moment], value: moment }));
  }

  protected onMomentSingleRateToggle(day: dayOfWeekFullName, moment: MomentCode, checked: boolean): void {
    const group = this.currentMomentGroup;
    if (!group) return;

    const switches = this.getMomentSwitches(day, moment);

    const controlSwitchMap = [
      { control: group.controls.adultRate, switch: switches.adult },
      { control: group.controls.childRate, switch: switches.child },
      { control: group.controls.studentRate, switch: switches.student },
      { control: group.controls.twoPersonGroupRate, switch: switches.twoPersonGroup }
    ];

    if (checked) {
      this.syncMomentRatesWithSingleRate(group, controlSwitchMap);
      this.disableRateControls(controlSwitchMap);
    } else {
      this.enableRateControls(controlSwitchMap);
    }

    this.getMomentReadOnly(day, moment).set(checked);
  }

  protected onMomentRateToggle(day: dayOfWeekFullName, moment: MomentCode, rateField: keyof IRateFields, checked: boolean): void {
    const group = this.currentMomentGroup;
    if (!group) return;

    const control = group.get(rateField);
    if (!control) return;

    const singleRate = group.controls.singleRate.value;
    const switches = this.getMomentSwitches(day, moment);
    const isSingleRateActive = switches.singleRate.value;

    if (checked && isSingleRateActive) {
      control.patchValue(singleRate);
      control.disable();
    } else if (checked && !isSingleRateActive) {
      control.enable();
    } else {
      control.patchValue(null);
      control.reset();
      control.disable();
    }
  }

  protected getMomentReadOnly(day: dayOfWeekFullName, moment: MomentCode): WritableSignal<boolean> {
    const key = `${day}-${moment}`;

    if (!this.momentReadOnlyStates.has(key)) {
      this.momentReadOnlyStates.set(key, signal(false));
    }

    return this.momentReadOnlyStates.get(key)!;
  }

  private initVariableForm(): void {
    this.stepFormForVariableRate = this.createVariablePricingForm();
    this.initializeVariableModeSelectors();
  }

  private createVariablePricingForm(): FormGroup<IVariablePricingForm> {
    const dayMomentCombinations = this.buildDayMomentCombinations();

    return this.fb.group<IVariablePricingForm>({
      dayPricings: this.fb.array(
        dayMomentCombinations.map(combo => this.createDayPricingGroup(combo.day, combo.moment))
      )
    });
  }

  private buildDayMomentCombinations(): Array<{ day: dayOfWeekFullName; moment: MomentCode }> {
    const combinations: Array<{ day: dayOfWeekFullName; moment: MomentCode }> = [];

    this.daySchedules().forEach(schedule => {
      const realMoments = schedule.availableMoments.filter(m => m !== 'ALL') as MomentCode[];
      realMoments.forEach(moment => combinations.push({ day: schedule.day, moment }));
    });

    return combinations;
  }

  private createDayPricingGroup(day: dayOfWeekFullName, moment: MomentCode): FormGroup<IDayPricingForm> {
    return this.fb.group<IDayPricingForm>({
      day: this.fb.control(day),
      selectedMoment: this.fb.control<MomentCode>(moment, { nonNullable: true }),
      singleRate: this.fb.control(null, [Validators.required, Validators.min(0)]),
      adultRate: this.fb.control(null, [Validators.required, Validators.min(0)]),
      childRate: this.fb.control(null, [Validators.required, Validators.min(0)]),
      studentRate: this.fb.control(null, [Validators.required, Validators.min(0)]),
      twoPersonGroupRate: this.fb.control(null, [Validators.required, Validators.min(0)])
    });
  }

  private initializeVariableModeSelectors(): void {
    const firstDay = this.getUniqueDays()[0];

    this.selectedDayControl.setValue(firstDay);

    const firstMoment = this.getMomentOptionsForSelectedDay()[0]?.value;

    if (firstMoment) this.selectedMomentControl.setValue(firstMoment);
  }

  private watchMomentSingleRateForSwitchState(day: dayOfWeekFullName, moment: MomentCode): void {
    const group = this.findDayPricingGroup(day, moment);
    if (!group) return;

    group.controls.singleRate.valueChanges
      .pipe(debounceTime(500), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        const switches = this.getMomentSwitches(day, moment);
        if (isValueExist(value)) {
          switches.singleRate.enable();
        } else {
          switches.singleRate.patchValue(false, { emitEvent: false });
          switches.singleRate.disable();
        }
      });

    this.watchMomentSingleRateForFieldSync(day, moment);
  }

  private watchMomentSingleRateForFieldSync(day: dayOfWeekFullName, moment: MomentCode): void {
    const group = this.findDayPricingGroup(day, moment);
    if (!group) return;

    group.controls.singleRate.valueChanges
      .pipe(debounceTime(500), takeUntilDestroyed(this.destroyRef))
      .subscribe(value => {
        const switches = this.getMomentSwitches(day, moment);
        if (!switches.singleRate.value) return;

        [
          { control: group.controls.adultRate, switch: switches.adult },
          { control: group.controls.childRate, switch: switches.child },
          { control: group.controls.studentRate, switch: switches.student },
          { control: group.controls.twoPersonGroupRate, switch: switches.twoPersonGroup },
        ].forEach(({ control, switch: sw }) => {
          if (sw.value) control.patchValue(value, { emitEvent: false });
        });
      });
  }

  private findDayPricingGroup(day: dayOfWeekFullName, moment: MomentCode): FormGroup<IDayPricingForm> | undefined {
    return this.dayPricings.controls.find(
      g => g.controls.day.value === day && g.controls.selectedMoment.value === moment
    );
  }

  private syncMomentRatesWithSingleRate(
    group: FormGroup<IDayPricingForm>,
    controlSwitchMap: Array<{ control: any; switch: FormControl<boolean> }>
  ): void {
    const singleRate = group.controls.singleRate.value;

    controlSwitchMap.forEach(({ control, switch: sw }) => {
      if (sw.value) {
        control.patchValue(singleRate);
      }
    });
  }

  private buildDaySchedulesFromDraft(scheduledActivities: any[]): void {
    const activities: IScheduledActivity[] = scheduledActivities.map(s => ({
      ...s,
      dayOfWeek: s.dayOfWeek?.map((day: string) => day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()) as dayOfWeekFullName[],
      openTime: s.openTime ? new Date(`1970-01-01T${s.openTime}Z`) : undefined,
      closeTime: s.closeTime ? new Date(`1970-01-01T${s.closeTime}Z`) : undefined,
      breakStart: s.breakStart ? new Date(`1970-01-01T${s.breakStart}Z`) : undefined,
      breakEnd: s.breakEnd ? new Date(`1970-01-01T${s.breakEnd}Z`) : undefined,
    }));

    this.daySchedules.set(buildDaySchedules(activities));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Mode Switching
  // ─────────────────────────────────────────────────────────────────────────
  onPricingModeChange(checked: boolean): void {
    this.isPriceModelHasChanged.set(checked);

    if (checked) {
      this.switchToVariableMode();
    } else {
      this.switchToSimpleMode();
    }
  }

  private switchToVariableMode(): void {
    this.stepForm = this.createSimplePricingForm();
    this.initVariableForm();

    this.daySwitches.clear();
    this.momentSwitches.clear();
    this.momentReadOnlyStates.clear();
  }

  private switchToSimpleMode(): void {
    this.stepForm = this.createSimplePricingForm();
    this.stepFormForVariableRate = undefined;
    this.watchSingleRateForSwitchState();
  }
}
