import { FormControl } from "@angular/forms";

export interface IStepOneForm {
  name: FormControl<string | null>;
  categories: FormControl<string[] | null>;
  description: FormControl<string | null>;
  photos: FormControl<File[] | null>;
}

export interface IStepOne {
    name: string | null;
    categories: any[] | null;
    description: string | null;
    photos: File[] | null;
}