import { AbstractControl, FormGroup, ValidationErrors } from "@angular/forms";

export type ErrorPriorityType = 'required' | 'minFiles' | 'minlength' | 'maxlength' | 'min' | 'max';

export abstract class CommonsValidations<
    T extends { [K in keyof T]: AbstractControl<any> },
    U extends { [K in keyof U]: AbstractControl<any> } = any
> {

    protected abstract stepForm: FormGroup<T>;
    protected stepFormForVariableRate?: FormGroup<U>;

    protected abstract errorPriority: ErrorPriorityType[];
    protected abstract errorMessages: Record<string, Record<string, string>>;

    protected getErrorMessage(fieldName: keyof T & string): string {
        const control = this.stepForm.get(fieldName);
        const errors = control?.errors;

        if (!errors) return '';

        const errorType = this.errorPriority.find(type => errors[type]);
        return errorType ? this.errorMessages[fieldName]?.[errorType] || '' : '';
    }

    protected getVariableErrorMessage(fieldName: keyof U & string): string {
        const control = this.stepFormForVariableRate?.get(fieldName);
        const errors = control?.errors;

        if (!errors) return '';

        const errorType = this.errorPriority.find(type => errors[type]);
        return errorType ? this.errorMessages[fieldName]?.[errorType] || '' : '';
    }

    protected minFilesValidator(min: number) {
        return (control: AbstractControl): ValidationErrors | null => {
            const files = control.value as File[] | null;
            const fileCount = files?.length || 0;

            if (control.dirty && fileCount < min) {
                return { minFiles: { min, actual: fileCount } };
            }

            return null;
        };
    }
}