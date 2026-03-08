import { NgComponentOutlet } from '@angular/common';
import { AfterViewInit, Component, computed, inject, Injector, OnDestroy, QueryList, runInInjectionContext, signal, Type, ViewChildren, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { Step1 } from '../steps/step-1/step-1';
import { Step2 } from '../steps/step-2/step-2';
import { Step3 } from '../steps/step-3/step-3';
import { Step4 } from '../steps/step-4/step-4';
import { stepsData } from './data/steps.data';
import { CapitalizePipe } from '../../../pipes/capitalize.pipe';
import { debounceTime, distinctUntilChanged, first, firstValueFrom, forkJoin, map, Observable, startWith, Subscription } from 'rxjs';
import { IconSvg } from "../../../components/icon-svg/icon-svg";
import { CommonsValidations } from '../steps/commons';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { toObservable } from '@angular/core/rxjs-interop';
import { isValueExist } from '../../../utils/string';
import { ActivityService } from '../../../services/activity.service';
import { ToastService } from '../../../services/toast.service';
import { StorageService } from '../../../services/storage.service';
import { IScheduledActivityPayload } from '../steps/step-2/step-2.interface';
import { toTimeString } from '../../../utils/date';
import { IStepFour } from '../steps/step-4/step-4.interface';

@Component({
  selector: 'app-steps-skeleton',
  imports: [
    ButtonModule,
    StepperModule,
    NgComponentOutlet,
    CapitalizePipe,
    IconSvg
  ],
  templateUrl: './steps-skeleton.html',
  styleUrl: './steps-skeleton.css',
  encapsulation: ViewEncapsulation.None,
})
export class StepsSkeleton implements AfterViewInit, OnDestroy {
  @ViewChildren(NgComponentOutlet) outlets!: QueryList<NgComponentOutlet>;

  private activityService = inject(ActivityService);
  private injector = inject(Injector);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);

  currentStep = signal(1);

  stepsData = stepsData;

  isStepOneValid = signal(false);
  isStepTwoValid = signal(false);
  isStepThrValid = signal(false);
  isStepForValid = signal(false);

  isStepOneDraftValid = signal(false);
  isStepTwoDraftValid = signal(false);
  isStepThrDraftValid = signal(false);
  isStepForDraftValid = signal(false);

  isAllStepValid = computed(() => {
    return this.isStepOneValid() && this.isStepTwoValid() && this.isStepThrValid() && this.isStepForValid();
  })

  private subscriptions: Subscription[] = [];
  private draftSubscriptions: Subscription[] = [];

  isLoading = signal(false);

  ngAfterViewInit(): void {
    this.syncStepsStatus();
    this.syncDraftStatus();

    this.navigateToFirstInvalidStep();
  }

  private navigateToFirstInvalidStep(): void {
    const outlets = this.outlets.toArray();

    const step1 = outlets[0]?.componentInstance as Step1;
    const step2 = outlets[1]?.componentInstance as Step2;
    const step3 = outlets[2]?.componentInstance as Step3;
    const step4 = outlets[3]?.componentInstance as Step4;

    const ready$ = [
      step1.onFormReady$,
      step2.onFormReady$,
      step3.onFormReady$,
      step4.onFormReady$,
    ];

    forkJoin(ready$.map(obs$ => obs$.pipe(first()))).subscribe(validities => {
      const firstInvalidIndex = validities.findIndex(valid => !valid);
      const targetStep = firstInvalidIndex === -1 ? 4 : firstInvalidIndex + 1;
      this.currentStep.set(targetStep);
    });
  }

  /* 
  * Why use <any, any> here ?
  *
  * With a single generic <T>, all steps shared exactly the same basic structure
  * but i implemented a new generic form for step 4 <U> : 
  
  * Step1 = CommonsValidations<IStepOneForm, IStepOneForm>
  * Step4 = CommonsValidations<ISimplePricingForm, IVariablePricingForm>

  * These types are now incompatible with each other according to TypeScript, which is why i need to use <any, any>.
  * In fact, strictly typing getStepComponent is useless here because even if i did so, further down when creating 
  * instances, i  would be forced to do a manual cast. This prove that typing this method does not provide any real 
  * type safety initialy. The only meaningful constraint i can add here is to tell Typescript that i expect at least 
  * one class that inherits from CommonsValidations.*/
  getStepComponent(step: number): Type<CommonsValidations<any, any>> {
    const stepComponents: Record<number, Type<CommonsValidations<any, any>>> = {
      1: Step1,
      2: Step2,
      3: Step3,
      4: Step4,
    };
    return stepComponents[step as keyof typeof stepComponents];
  }

  nextStep(nextStep: number, callback: (value: number) => void) {
    this.saveDraft();

    this.currentStep.set(nextStep);
    callback(nextStep);

    this.syncStepsStatus();
    this.syncDraftStatus();
  }

  previousStep(previousStep: number, callback: (value: number) => void) {
    this.currentStep.set(previousStep);
    callback(previousStep);

    this.syncStepsStatus();
  }

  private watchFormStatus(form: AbstractControl): Observable<boolean> {
    return form.statusChanges.pipe(
      startWith(form.status),
      debounceTime(500),
      map(status => status === 'VALID'),
      distinctUntilChanged()
    );
  }

  syncStepsStatus() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];

    const currentStepIndex = this.currentStep() - 1;
    const currentOutlet = this.outlets.toArray()[currentStepIndex];

    if (!currentOutlet) {
      console.error('Outlet non trouvé pour step', this.currentStep());
      return;
    }

    const componentInstance = currentOutlet.componentInstance;

    if (!componentInstance) {
      console.error('componentInstance est null pour step', this.currentStep());
      return;
    }

    switch (this.currentStep()) {
      case 1:
        const sub1 = this.watchFormStatus((componentInstance as Step1).stepForm)
          .subscribe(isValid => this.isStepOneValid.set(isValid));
        this.subscriptions.push(sub1);
        break;

      case 2:
        const sub2 = this.watchFormStatus((componentInstance as Step2).stepForm)
          .subscribe(isValid => this.isStepTwoValid.set(isValid));
        this.subscriptions.push(sub2);
        break;

      case 3:
        const sub3 = this.watchFormStatus((componentInstance as Step3).stepForm)
          .subscribe(isValid => this.isStepThrValid.set(isValid));
        this.subscriptions.push(sub3);
        break;

      case 4:
        const instance4 = componentInstance as Step4;

        const sub4 = runInInjectionContext(this.injector, () => toObservable(instance4.isPriceModelHasChanged)
          .pipe(debounceTime(500), distinctUntilChanged())
          .subscribe(() => this.updateStep4Validity(instance4))
        );
        this.subscriptions.push(sub4);
        break;
    }
  }

  private syncDraftStatus(): void {
    this.draftSubscriptions.forEach(sub => sub.unsubscribe());
    this.draftSubscriptions = [];

    const currentStepIndex = this.currentStep() - 1;

    const currentOutlet = this.outlets.toArray()[currentStepIndex];
    if (!currentOutlet) {
      console.error('Outlet non trouvé pour step', this.currentStep());
      return;
    }

    const componentInstance = currentOutlet.componentInstance;
    if (!componentInstance) {
      console.error('componentInstance est null pour step', this.currentStep());
      return;
    }

    switch (this.currentStep()) {
      case 1:
        const stepOneForm = (componentInstance as Step1).stepForm;
        const sub1 = stepOneForm.valueChanges
          .pipe(startWith(stepOneForm.value), debounceTime(500))
          .subscribe(() => {
            this.isStepOneDraftValid.set(
              this.isFormDraftValid(stepOneForm) && isValueExist(stepOneForm.controls.name.value)
            );
          });
        this.draftSubscriptions.push(sub1);
        break;

      case 2:
        const stepTwoForm = (componentInstance as Step2).stepForm;
        const sub2 = stepTwoForm.valueChanges
          .pipe(startWith(stepTwoForm.value), debounceTime(500))
          .subscribe(() => {
            this.isStepTwoDraftValid.set(this.isFormDraftValid(stepTwoForm));
          });
        this.draftSubscriptions.push(sub2);
        break;

      case 3:
        const stepThreeForm = (componentInstance as Step3).stepForm;
        const sub3 = stepThreeForm.valueChanges
          .pipe(startWith(stepThreeForm.value), debounceTime(500))
          .subscribe(() => {
            this.isStepThrDraftValid.set(this.isFormDraftValid(stepThreeForm));;
          });
        this.draftSubscriptions.push(sub3);
        break;

      case 4:
        const instance4 = componentInstance as Step4;

        const updateValidity = () => {
          const form = (instance4.switchVariablePricing.value && instance4.stepFormForVariableRate
            ? instance4.stepFormForVariableRate
            : instance4.stepForm) as FormGroup;
          this.isStepForDraftValid.set(this.isFormDraftValid(form));
        };

        // On attend que le mode soit prêt avant de s'abonner au bon formulaire
        const sub4Mode = instance4.onModeReady$.subscribe(isVariable => {
          if (isVariable && instance4.stepFormForVariableRate) {
            instance4.dayPricings.controls.forEach(group => {
              const sub = group.valueChanges
                .pipe(debounceTime(500))
                .subscribe(() => updateValidity());
              this.draftSubscriptions.push(sub);
            });
          } else {
            const sub = instance4.stepForm.valueChanges
              .pipe(startWith(instance4.stepForm.value), debounceTime(500))
              .subscribe(() => updateValidity());
            this.draftSubscriptions.push(sub);
          }
          updateValidity();
        });
        this.draftSubscriptions.push(sub4Mode);

        // Re-subscribe quand l'utilisateur change de mode manuellement
        const sub4Switch = instance4.switchVariablePricing.valueChanges.subscribe(() => {
          this.syncDraftStatus();
        });
        this.draftSubscriptions.push(sub4Switch);
        break;
    }
  }

  protected async saveDraft(): Promise<void> {
    const currentStepIndex = this.currentStep() - 1;
    const currentOutlet = this.outlets.toArray()[currentStepIndex];

    if (!currentOutlet) {
      console.error('Outlet non trouvé pour step', this.currentStep());
      return;
    }

    const componentInstance = currentOutlet?.componentInstance;
    if (!componentInstance) return;

    switch (this.currentStep()) {
      case 1:
        const stepOneForm = (componentInstance as Step1).stepForm;
        const { name, photos } = stepOneForm.getRawValue();
        if (!name) return;

        this.isLoading.set(true);

        const limitPreview = (componentInstance as Step1).FILE_LIMIT;
        if (!await this.canStoreImages(name, limitPreview, photos)) return;

        this.activityService.saveDraft({
          step1: stepOneForm.getRawValue(),
          step2: null,
          step3: null,
          step4: null
        }).subscribe({
          next: (response: { activityId: string }) => {
            (componentInstance as Step1).refreshImages();
            this.storeActivityIdInStorage(response.activityId);
            this.toastService.success('Formulaire sauvegardé avec succès');
          },
          error: (error: Error) => {
            this.toastService.error('Erreur lors de la sauvegarde, veuilez contacter le service client');
            console.error(error.name);
            this.isLoading.set(false);
          },
          complete: () => {
            this.isLoading.set(false);
          }
        })
        break;

      case 2:
        const rawValues = (componentInstance as Step2).stepForm.getRawValue();

        this.isLoading.set(true);

        this.activityService.saveDraft({
          step1: null,
          step2: {
            ...rawValues,
            automaticValidation: rawValues.automaticValidation === 'Automatic',
            childAllowedWithAdult: rawValues.childAllowedWithAdult === 'Yes',
            scheduledActivities: rawValues.scheduledActivities.map((s): IScheduledActivityPayload => ({
              id: s.id,
              dayOfWeek: s.dayOfWeek.map(day => day.toUpperCase()),
              openTime: s.openTime ? toTimeString(s.openTime) : null,
              closeTime: s.closeTime ? toTimeString(s.closeTime) : null,
              breakStart: s.breakStart ? toTimeString(s.breakStart) : null,
              breakEnd: s.breakEnd ? toTimeString(s.breakEnd) : null,
            }))
          },
          step3: null,
          step4: null
        }).subscribe({
          next: (response: { activityId: string }) => {
            this.storeActivityIdInStorage(response.activityId);
            this.toastService.success('Formulaire sauvegardé avec succès');
          },
          error: (error: Error) => {
            this.toastService.error('Erreur lors de la sauvegarde, veuilez contacter le service client');
            console.error(error.name);
            this.isLoading.set(false);
          },
          complete: () => {
            this.isLoading.set(false);
          }
        })
        break;

      case 3:
        const { step1: storedStep1 } = this.storageService.getActivityDraftStorage();

        if (!storedStep1?.name) {
          this.toastService.error('Vous devez d\'abord donner un nom à votre activité avant de pouvoir la sauvegarder');
          return;
        }

        const stepThreeRawValues = (componentInstance as Step3).stepForm.getRawValue();
        const programImages = stepThreeRawValues.program.map(p => p.image).filter((file): file is File => file !== null);
        const limitProgram = (componentInstance as Step3).PROGRAM_MAX_LENGTH;

        if (!await this.canStoreImages(storedStep1.name, limitProgram, programImages)) return;

        this.isLoading.set(true);

        this.activityService.saveDraft({
          step1: null,
          step2: null,
          step3: {
            goodToKnow: stepThreeRawValues.goodToKnow,
            program: stepThreeRawValues.program.map(p => ({
              title: p.title ?? '',
              description: p.description ?? '',
              image: p.image
            }))
          },
          step4: null
        }).subscribe({
          next: (response: { activityId: string }) => {
            (componentInstance as Step3).refreshImages();
            this.storeActivityIdInStorage(response.activityId);
            this.toastService.success('Formulaire sauvegardé avec succès');
          },
          error: (error: Error) => {
            this.toastService.error('Erreur lors de la sauvegarde, veuilez contacter le service client');
            console.error(error.name);
            this.isLoading.set(false);
          },
          complete: () => {
            this.isLoading.set(false);
          }
        })
        break;

      case 4:
        const instance4 = componentInstance as Step4;
        const isVariablePricing = instance4.switchVariablePricing.value;

        this.isLoading.set(true);

        const step4Payload: IStepFour = isVariablePricing
          ? {
            isVariablePricing: true,
            simplePricing: null,
            variablePricing: {
              dayPricings: instance4.dayPricings.getRawValue().map(p => {
                const switches = instance4.getMomentSwitches(p.day!, p.selectedMoment);
                return {
                  day: p.day,
                  selectedMoment: p.selectedMoment,
                  singleRate: p.singleRate,
                  adultRate: p.adultRate,
                  childRate: p.childRate,
                  studentRate: p.studentRate,
                  twoPersonGroupRate: p.twoPersonGroupRate,
                  isAdultEnabled: switches.adult.value,
                  isChildEnabled: switches.child.value,
                  isStudentEnabled: switches.student.value,
                  isGroup2Enabled: switches.twoPersonGroup.value,
                };
              })
            }
          }
          : {
            isVariablePricing: false,
            simplePricing: {
              singleRate: instance4.stepForm.getRawValue().singleRate,
              adultRate: instance4.stepForm.getRawValue().adultRate,
              childRate: instance4.stepForm.getRawValue().childRate,
              studentRate: instance4.stepForm.getRawValue().studentRate,
              twoPersonGroupRate: instance4.stepForm.getRawValue().twoPersonGroupRate,
              isAdultEnabled: instance4.switchAdultRate.value,    // 🆕
              isChildEnabled: instance4.switchChildRate.value,    // 🆕
              isStudentEnabled: instance4.switchStudentRate.value,  // 🆕
              isGroup2Enabled: instance4.switchTwoPersonGroup.value, // 🆕
            },
            variablePricing: null
          };

        this.activityService.saveDraft({
          step1: null,
          step2: null,
          step3: null,
          step4: step4Payload
        }).subscribe({
          next: (response: { activityId: string }) => {
            this.storeActivityIdInStorage(response.activityId);
            this.toastService.success('Formulaire sauvegardé avec succès');
          },
          error: (error: Error) => {
            this.toastService.error('Erreur lors de la sauvegarde, veuilez contacter le service client');
            console.error(error.name);
            this.isLoading.set(false);
          },
          complete: () => this.isLoading.set(false)
        });
        break;
    }
  }

  private async canStoreImages(name: string, limit: number, files: File[] | null): Promise<boolean> {
    if (files && files.length > 0) {
      const storedImagesNbr = await firstValueFrom(
        this.activityService.getImagesNumber('PREVIEW', name)
      );

      if (storedImagesNbr + files.length > limit) {
        this.toastService.error("Vous dépassez le nombre maximal d'images autorisées (5)");
        return false;
      };
    }

    return true;
  }

  private updateStep4Validity(instance: Step4): void {
    // Nettoyer l'ancienne subscription step 4 si elle existe
    // const oldSub = this.subscriptions.find(s => (s as any).__step4);
    // if (oldSub) {
    //   oldSub.unsubscribe();
    //   const index = this.subscriptions.indexOf(oldSub);
    //   this.subscriptions.splice(index, 1);
    // }

    // Créer la nouvelle subscription sur le bon formulaire
    const form = instance.isPriceModelHasChanged()
      ? instance.stepFormForVariableRate
      : instance.stepForm;

    if (!form) return;

    const sub = this.watchFormStatus(form)
      .subscribe(isValid => this.isStepForValid.set(isValid));
    this.subscriptions.push(sub);
  }


  private hasAtLeastOneValue(control: AbstractControl): boolean {
    if (control instanceof FormControl) {
      const value = control.value;

      if (Array.isArray(value)) {
        return value.length > 0;
      }

      return isValueExist(value);
    }

    if (control instanceof FormGroup) {
      return Object.values(control.controls).some(child =>
        this.hasAtLeastOneValue(child)
      );
    }

    if (control instanceof FormArray) {
      return control.controls.some(child =>
        this.hasAtLeastOneValue(child)
      );
    }

    return false;
  }

  private hasVisibleErrors(control: AbstractControl): boolean {
    if (control instanceof FormControl) {
      return control.errors != null && (control.touched || control.dirty);
    }

    if (control instanceof FormGroup) {
      return Object.values(control.controls).some(child =>
        this.hasVisibleErrors(child)
      );
    }

    if (control instanceof FormArray) {
      if (control.errors != null) return true;

      return control.controls.some(child =>
        this.hasVisibleErrors(child)
      );
    }

    return false;
  }

  protected isFormDraftValid(form: FormGroup): boolean {
    return this.hasAtLeastOneValue(form) && !this.hasVisibleErrors(form);
  }

  storeActivityIdInStorage(activityId: string): void {
    this.storageService.mergeItem('activityDraft', { activityId });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.draftSubscriptions.forEach(sub => sub.unsubscribe());
    localStorage.removeItem('activityDraft');
  }
}
