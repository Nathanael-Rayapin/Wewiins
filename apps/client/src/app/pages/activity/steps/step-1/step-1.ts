import { ChangeDetectorRef, Component, inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { categoriesData, errorMessages } from './data/step1.data';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';
import { IFile } from '../../../../interfaces/upload-file';
import { PhotoBadge } from '../../../../components/photo-badge/photo-badge';
import { Validators } from '@angular/forms';
import { CategoryType, IStepOneForm } from './step-1.interface';
import { CommonsValidations, ErrorPriorityType } from '../commons';
import { ToastService } from '../../../../services/toast.service';
import { IconSvg } from '../../../../components/icon-svg/icon-svg';
import { convertToWebp } from '../../../../utils/image';
import { ActivityImagePreview } from '../../../../components/activity-image-preview/activity-image-preview';
import { ActivityService } from '../../../../services/activity.service';
import { catchError, debounceTime, filter, map, merge, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { isValueExist } from '../../../../utils/string';
import { StorageService } from '../../../../services/storage.service';

@Component({
  selector: 'app-step-1',
  imports: [
    PhotoBadge,
    ReactiveFormsModule,
    InputTextModule,
    MultiSelectModule,
    FormsModule,
    TextareaModule,
    FileUploadModule,
    ActivityImagePreview,
    IconSvg,
    AsyncPipe
  ],
  templateUrl: './step-1.html',
  styleUrl: './step-1.css',
  encapsulation: ViewEncapsulation.None,
})
export class Step1 extends CommonsValidations<IStepOneForm> implements OnInit {
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  selectedFiles: IFile[] = [];

  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);
  private activityService = inject(ActivityService);
  private storageService = inject(StorageService);

  private readonly MAX_FILE_SIZE = 800000;
  private readonly MAX_FILE_SIZE_MB = 0.8;

  public readonly FILE_LIMIT = 5;
  public readonly onFormReady$ = new Subject<boolean>(); 

  protected readonly errorPriority: ErrorPriorityType[] = ['required', 'minFiles', 'minlength', 'maxlength'];

  protected readonly errorMessages = errorMessages;

  protected isImagePreviewVisible = false;

  private refreshImages$ = new Subject<void>();

  isValueExist = isValueExist;

  categoriesData = categoriesData;
  selectedCategories: string[] = [];

  override stepForm = this.fb.group({
    name: new FormControl('', [
      Validators.required, Validators.minLength(3)
    ]),
    categories: new FormControl<CategoryType[]>([], [
      Validators.required, Validators.minLength(1)
    ]),
    description: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(500)
    ]),
    photos: new FormControl<File[]>([], [
      Validators.required,
      Validators.minLength(3),
      this.minFilesValidator(3),
    ])
  });

  get descriptionLength(): number {
    return this.stepForm.controls.description?.value?.length || 0;
  }

  get isNameValid(): boolean {
    return isValueExist(this.stepForm.controls.name.value)
      && this.stepForm.controls.name.valid;
  }

  ngOnInit(): void {
    this.patchFormWithExistingData();
  }

  public refreshImages(): void {
    this.refreshImages$.next();
  }

  protected selectedFilesFromStorage$: Observable<string[]> = merge(
    this.stepForm.controls.name.valueChanges.pipe(
      debounceTime(500),
      filter(name => !!name && name.length >= 3),
    ),
    this.refreshImages$.pipe(
      map(() => this.stepForm.controls.name.value)
    )
  ).pipe(
    startWith(this.stepForm.controls.name.value),
    switchMap(name => {
      if (!name) return of([]);

      return this.activityService.getImages('PREVIEW', name).pipe(
        catchError(() => of([]))
      );
    })
  );

  protected async loadFiles(event: FileSelectEvent) {
    const formattedFiles = await Promise.all(
      event.currentFiles.map(file => convertToWebp(file))
    );

    const error = this.getFileError(formattedFiles);
    if (error) {
      this.clearInvalidFiles(formattedFiles);
      this.toastService.error(error);
      return;
    }

    this.selectedFiles = formattedFiles.map((file: File, index: number) => ({
      id: index === 0 ? `primary-${crypto.randomUUID()}` : crypto.randomUUID(),
      file,
      src: URL.createObjectURL(file)
    }));

    this.updateFilesOnForm();
    this.cdr.detectChanges();
  }

  protected storeActivityNameInStorage(): void {
    const name = this.stepForm.controls.name.value;
    if (!name) return;

    this.storageService.mergeItem('activityDraft', {
      step1: { name }
    });
  }

  protected removeSingleFile(index: number) {
    URL.revokeObjectURL(this.selectedFiles[index].src);

    this.selectedFiles.splice(index, 1);

    if (this.fileUpload) {
      this.fileUpload.files.splice(index, 1);
    }

    this.updateFilesOnForm();
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
        if (!draft.step1) return;

        this.stepForm.patchValue({
          name: draft.step1.name,
          description: draft.step1.description,
          categories: draft.step1.categories as CategoryType[] ?? [],
          photos: null,
        });

        if (draft.step1.photos && draft.step1.photos.length >= 3) {
          this.stepForm.controls.photos.clearValidators();
          this.stepForm.controls.photos.updateValueAndValidity();
        }

        this.storageService.mergeItem('activityDraft', {
          activityId: draft.activityId,
          step1: { name: draft.step1.name }
        });

        this.stepForm.updateValueAndValidity();
        this.onFormReady$.next(this.stepForm.valid);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  private updateFilesOnForm(): void {
    const filesSortedByPrimary = this.selectedFiles
      .sort((a, b) => a.id.startsWith('primary-') ? -1 : b.id.startsWith('primary-') ? 1 : 0)
      .map(s => s.file);

    this.stepForm.patchValue({ photos: filesSortedByPrimary });
    this.stepForm.controls.photos.markAsDirty();
    this.stepForm.controls.photos.updateValueAndValidity();
  }

  private getFileError(currentFiles: File[]): string | null {
    if (currentFiles.length > this.FILE_LIMIT || this.selectedFiles.length > this.FILE_LIMIT)
      return `Maximum ${this.FILE_LIMIT} photos autorisées.`;

    const hasOversized = currentFiles.some(f => f.size > this.MAX_FILE_SIZE);
    if (hasOversized)
      return `Taille maximale : ${this.MAX_FILE_SIZE_MB} Mo par fichier.`;

    return null;
  }

  private clearInvalidFiles(files: File[]): void {
    const oversizedFiles = files.filter(f => f.size > this.MAX_FILE_SIZE);

    if (oversizedFiles.length > 0) {
      oversizedFiles.forEach(file => this.fileUpload.files.splice(this.fileUpload.files.indexOf(file), 1));
    } else {
      this.fileUpload.files.splice(0, this.fileUpload.files.length);
    }
  }

}