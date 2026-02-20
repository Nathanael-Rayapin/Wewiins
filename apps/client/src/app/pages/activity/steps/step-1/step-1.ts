import { Component, inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { categoriesData, errorMessages } from './data/step1.data';
import { MultiSelectModule } from 'primeng/multiselect';
import { TextareaModule } from 'primeng/textarea';
import { FileSelectEvent, FileUpload, FileUploadModule } from 'primeng/fileupload';
import { IFile } from '../../../../interfaces/upload-file';
import { PhotoBadge } from '../../../../components/photo-badge/photo-badge';
import { Validators } from '@angular/forms';
import { IStepOne, IStepOneForm } from './step-1.interface';
import { CommonsValidations, ErrorPriorityType } from '../commons';
import { ToastService } from '../../../../services/toast.service';
import { IconSvg } from '../../../../components/icon-svg/icon-svg';

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
    IconSvg
  ],
  templateUrl: './step-1.html',
  styleUrl: './step-1.css',
  encapsulation: ViewEncapsulation.None,
})
export class Step1 extends CommonsValidations<IStepOneForm> implements OnInit {
  // Files
  selectedFiles: IFile[] = [];
  @ViewChild('fileUpload') fileUpload!: FileUpload;

  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  private readonly MAX_FILE_SIZE = 800000;
  private readonly MAX_FILE_SIZE_MB = 781.25;
  private readonly FILE_LIMIT = 5;

  protected readonly errorPriority: ErrorPriorityType[] = ['required', 'minFiles', 'minlength', 'maxlength'];

  protected readonly errorMessages = errorMessages;

  categoriesData = categoriesData;
  selectedCategories: string[] = [];

  override stepForm = this.fb.group({
    name: new FormControl('', [
      Validators.required, Validators.minLength(3)
    ]),
    categories: new FormControl<string[]>([], [
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

  ngOnInit(): void {
    this.patchFormWithExistingData();
  }

  get descriptionLength(): number {
    return this.stepForm.controls.description?.value?.length || 0;
  }

  canLoadFiles(currentFiles: File[]): boolean {
    // Files Limit Exceeded
    if (currentFiles.length > this.FILE_LIMIT || this.selectedFiles.length > this.FILE_LIMIT) {
      this.toastService.error(
        'Trop de fichiers',
        `Maximum ${this.FILE_LIMIT} photos autorisées.`
      );
      this.fileUpload.files.splice(0, this.fileUpload.files.length);
      return false;
    }

    // Files Over Size
    const oversizedFiles = currentFiles.filter(
      file => file.size > this.MAX_FILE_SIZE
    );

    if (oversizedFiles.length > 0) {
      this.toastService.error(
        'Fichiers trop volumineux',
        `Taille maximale : ${this.MAX_FILE_SIZE_MB} Mo par fichier.`
      );
      oversizedFiles.forEach(file => this.fileUpload.files.splice(this.fileUpload.files.indexOf(file), 1));
      return false;
    }

    return true;
  }

  protected loadFiles(event: FileSelectEvent) {
    if (!this.canLoadFiles(event.currentFiles)) return;

    this.selectedFiles = event.currentFiles.map((file: File) => ({
      id: crypto.randomUUID(),
      file,
      src: URL.createObjectURL(file)
    }));

    this.updateFilesOnForm();
  }

  protected removeSingleFile(index: number) {
    URL.revokeObjectURL(this.selectedFiles[index].src);

    this.selectedFiles.splice(index, 1);

    if (this.fileUpload) {
      this.fileUpload.files.splice(index, 1);
    }

    this.updateFilesOnForm();
  }

  private updateFilesOnForm(): void {
    const files = this.selectedFiles.map(f => f.file);

    this.stepForm.patchValue({ photos: files });
    this.stepForm.controls.photos.markAsDirty();
    this.stepForm.controls.photos.updateValueAndValidity();
  }

  private patchFormWithExistingData(): void {
    const data = localStorage.getItem('activityData');

    if (data) {
      const formValues: IStepOne = JSON.parse(data);

      this.stepForm.patchValue({
        name: formValues.name,
        categories: formValues.categories,
        description: formValues.description,
      });

      if (formValues.photos && formValues.photos.length > 0) {
        this.stepForm.controls.photos.setErrors({ 'filesNotRestored': true });
        this.stepForm.controls.photos.markAllAsDirty();
      }

      this.stepForm.updateValueAndValidity();
    }
  }
}