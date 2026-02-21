import { ChangeDetectionStrategy, Component, inject, input, output, ViewEncapsulation } from '@angular/core';
import { TextareaModule } from 'primeng/textarea';
import { IconSvg } from "../icon-svg/icon-svg";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-add-program',
  imports: [CommonModule, TextareaModule, FormsModule, ReactiveFormsModule, FileUploadModule, IconSvg],
  templateUrl: './add-program.html',
  styleUrl: './add-program.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AddProgram {
  private breakpointObserver = inject(BreakpointObserver);
  
  isDesktop$ = toSignal(
    this.breakpointObserver
      .observe(['(min-width: 1024px)'])
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

  programForm = input.required<FormGroup>();
  index = input.required<number>();
  remove = output<void>();

  // Getters for accessing FormControl
  get titleControl(): FormControl {
    return this.programForm().get('title') as FormControl;
  }

  get descriptionControl(): FormControl {
    return this.programForm().get('description') as FormControl;
  }

  get imageControl(): FormControl {
    return this.programForm().get('image') as FormControl;
  }

  // Getters for values (for the character counter)
  get title(): string {
    return this.titleControl.value || '';
  }

  get description(): string {
    return this.descriptionControl.value || '';
  }

  get uploadedImage(): File | null {
    return this.imageControl.value;
  }

  get imagePreviewUrl(): string | null {
    if (this.uploadedImage) {
      return URL.createObjectURL(this.uploadedImage);
    }
    return null;
  }

  // Getters to check whether errors should be displayed
  get showTitleError(): boolean {
    return this.titleControl.invalid && (this.titleControl.dirty || this.titleControl.touched);
  }

  get showDescriptionError(): boolean {
    return this.descriptionControl.invalid && (this.descriptionControl.dirty || this.descriptionControl.touched);
  }

  get showImageError(): boolean {
    return this.imageControl.invalid && (this.imageControl.dirty || this.imageControl.touched);
  }

  protected onImageUpload(event: FileSelectEvent): void {
    const file = event.currentFiles[0];
    
    if (file) {
      this.imageControl.setValue(file);
      this.imageControl.markAsDirty();
      this.imageControl.markAsTouched();
    }
  }

  protected removeImage(): void {
    this.imageControl.setValue(null);
    this.imageControl.markAsDirty();
    this.imageControl.markAsTouched();
  }

  protected removeProgram(): void {
    this.remove.emit();
  }
}
