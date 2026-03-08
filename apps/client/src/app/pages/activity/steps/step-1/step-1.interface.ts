import { FormControl } from "@angular/forms";
import { categoriesData } from "./data/step1.data";

export interface IStepOneForm {
  name: FormControl<string | null>;
  categories: FormControl<CategoryType[] | null>;
  description: FormControl<string | null>;
  photos: FormControl<File[] | null>;
}

export interface IStepOne {
    name: string | null;
    categories: CategoryType[] | null;
    description: string | null;
    photos: File[] | null;
}

export type CategoryType = typeof categoriesData[number]["value"];