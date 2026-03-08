import { Component, DestroyRef, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { CommonsValidations, ErrorPriorityType } from '../commons';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IGoodToKnow, IProgram, IStepThree, IStepThreeForm, ProgramFormGroup } from './step-3.interface';
import { errorMessages, goodToKnowOptions } from './data/step-3.data';
import { AutoCompleteCompleteEvent, AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { IconSvg } from '../../../../components/icon-svg/icon-svg';
import { GoodToKnowCard } from '../../../../components/good-to-know-card/good-to-know-card';
import { AddProgram } from '../../../../components/add-program/add-program';
import { ToastService } from '../../../../services/toast.service';
import { fileValidator } from './step-3.validators';
import { StorageService } from '../../../../services/storage.service';
import { isValueExist } from '../../../../utils/string';
import { ActivityImageProgram } from '../../../../components/activity-image-program/activity-image-program';
import { catchError, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { ActivityService } from '../../../../services/activity.service';
import { AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-step-3',
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    FormsModule,
    AutoCompleteModule,
    IconSvg,
    GoodToKnowCard,
    AddProgram,
    ActivityImageProgram,
    AsyncPipe
  ],
  templateUrl: './step-3.html',
  styleUrl: './step-3.css',
  encapsulation: ViewEncapsulation.None,
})
export class Step3 extends CommonsValidations<IStepThreeForm> implements OnInit {
  PROGRAM_MAX_LENGTH = 6 as const;
  private destroyRef = inject(DestroyRef);

  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);
  private activityService = inject(ActivityService);

  protected readonly errorPriority: ErrorPriorityType[] = ['required'];

  protected readonly errorMessages = errorMessages;

  public readonly onFormReady$ = new Subject<boolean>();

  override stepForm = this.fb.group({
    goodToKnow: new FormControl<IGoodToKnow[] | null>(null, [
      Validators.required
    ]),
    program: this.fb.array<FormGroup<{
      title: FormControl<string | null>;
      description: FormControl<string | null>;
      image: FormControl<File | null>;
    }>>([], [
      Validators.required,
      this.allProgramsCompleteValidator()
    ])
  });

  private allProgramsCompleteValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formArray = control as FormArray;

      if (formArray.length === 0) return { incompleteProgramm: true };

      const hasIncomplete = formArray.controls.some(group => {
        const g = group as FormGroup;
        const hasImage = g.controls['image'].value != null || g.controls['image'].validator === null;
        return !g.controls['title'].value?.trim() || !g.controls['description'].value?.trim() || !hasImage;
      });

      return hasIncomplete ? { incompleteProgramm: true } : null;
    };
  }

  allOptions = goodToKnowOptions;
  suggestsOptions = goodToKnowOptions;
  selectedOptions = signal<IGoodToKnow[]>([]);
  filteredOptions: Pick<IGoodToKnow, 'name'>[] = [];

  searchValue: string = '';

  protected isImageProgramVisible = false;
  private refreshImages$ = new Subject<void>();

  get programsFormArray(): FormArray<ProgramFormGroup> {
    return this.stepForm.get('program') as FormArray<ProgramFormGroup>;
  }

  get isNameValid(): boolean {
    const { step1: storedStep1 } = this.storageService.getActivityDraftStorage();
    return isValueExist(storedStep1?.name);
  }

  constructor() {
    super();
    this.addProgram();
  }

  ngOnInit(): void {
    this.patchFormWithExistingData();
  }

  public refreshImages(): void {
    this.refreshImages$.next();
  }

  protected selectedFilesFromStorage$: Observable<string[]> = this.refreshImages$.pipe(
    startWith(null),
    switchMap(() => {
      const { step1: storedStep1 } = this.storageService.getActivityDraftStorage();

      if (!storedStep1?.name) return of([]);

      return this.activityService.getImages('PROGRAM', storedStep1.name).pipe(
        catchError(() => of([]))
      );
    })
  );

  /**
   * Good To Know Step
   */
  protected search(event: AutoCompleteCompleteEvent): void {
    const query = event.query?.toLowerCase().trim() || '';

    if (!query) {
      this.filteredOptions = [...this.allOptions];
      this.resetDisplayedOptions();
      return;
    }

    this.filteredOptions = this.allOptions.filter(option =>
      option.name.toLowerCase().includes(query)
    );
  }

  protected onSelectFromAutocomplete(event: AutoCompleteSelectEvent): void {
    const selectedOption = event.value as IGoodToKnow;

    this.suggestsOptions = this.allOptions.filter(
      option => option.name === selectedOption.name
    );
  }

  protected openDialogForSuggestion(): void {
    console.log("OK!");
  }

  // PrimeNg not provided a way to listen for empty value other 
  // than a "onClear" event but that required to trigger a button.
  protected onSearchValueChange(value: string): void {
    if (value != null) return;
    this.resetDisplayedOptions();
  }

  protected onGoodToKnowChange(isChecked: boolean, option: IGoodToKnow): void {
    if (isChecked) {
      this.selectedOptions.update(current => [...current, option]);
    } else {
      this.selectedOptions.update(current => current.filter(o => o.name !== option.name));
    }

    this.stepForm.patchValue({ goodToKnow: this.selectedOptions() });
  }

  protected addProgram(program?: IProgram): void {
    if (this.programsFormArray.length >= this.PROGRAM_MAX_LENGTH) {
      this.toastService.error(`Vous ne pouvez ajouter plus de ${this.PROGRAM_MAX_LENGTH} étapes.`);
      return;
    }
    this.programsFormArray.push(this.createProgramFormGroup(program));
  }

  protected removeProgram(index: number): void {
    this.programsFormArray.removeAt(index);
  }

  protected openDialogForIamgePreview(): void {
    this.isImageProgramVisible = true;
  }

  protected isOptionSelected(name: string): boolean {
    return this.selectedOptions().some(o => o.name === name);
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
        if (!draft.step3) return;

        this.patchGoodToKnow(draft.step3.goodToKnow);
        this.patchPrograms(draft.step3.program);
        this.stepForm.updateValueAndValidity();
        this.onFormReady$.next(this.stepForm.valid);
      },
      error: (err) => console.error(err)
    });
  }

  private patchGoodToKnow(goodToKnow: IStepThree['goodToKnow']): void {
    if (!goodToKnow?.length) return;

    const hydrated = goodToKnow.map(g => ({
      ...g,
      iconName: goodToKnowOptions.find(o => o.name === g.name)?.iconName ?? ''
    }));

    this.selectedOptions.set(hydrated);
    this.stepForm.patchValue({ goodToKnow: hydrated });
  }

  private patchPrograms(programs: IStepThree['program']): void {
    if (!programs?.length) return;

    this.programsFormArray.clear();
    programs.forEach(p => {
      const group = this.createProgramFormGroup({
        title: p.title ?? '',
        description: p.description ?? '',
        image: null
      });

      // Si une image est déjà stockée en BDD, on relâche le validator
      if (p.image) {
        group.controls['image'].clearValidators();
        group.controls['image'].updateValueAndValidity();
      }

      this.programsFormArray.push(group);
    });

    this.programsFormArray.updateValueAndValidity();
  }

  private createProgramFormGroup(program?: IProgram): FormGroup {
    const group = this.fb.group({
      title: [program?.title || '', Validators.required],
      description: [program?.description || '', Validators.required],
      image: [program?.image || null, fileValidator]
    });

    group.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.programsFormArray.updateValueAndValidity({ emitEvent: false });
      });

    return group;
  }

  private resetDisplayedOptions(): void {
    this.suggestsOptions = [...this.allOptions];
  }
}
