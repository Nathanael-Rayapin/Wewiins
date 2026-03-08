import { AbstractControl, ValidationErrors } from '@angular/forms';

export function fileValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value || !(value instanceof File)) {
    return { invalidFile: true };
  }
  return null;
}