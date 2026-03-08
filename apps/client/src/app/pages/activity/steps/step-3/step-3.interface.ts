import { FormArray, FormControl, FormGroup } from "@angular/forms";

export interface IStepThreeForm {
  goodToKnow: FormControl<IGoodToKnow[] | null>;
  program: FormArray<ProgramFormGroup>;
}

export interface IStepThree {
  goodToKnow: IGoodToKnow[] | null;
  program: IProgram[];
}

export type ProgramFormGroup = FormGroup<{
  title: FormControl<string | null>;
  description: FormControl<string | null>;
  image: FormControl<File | null>;
}>;

export interface IGoodToKnow {
  name: string;
  description: string;
  iconName: string;
}

export interface IProgram {
  title: string;
  description: string;
  image: File | null;
}