import { FormControl } from "@angular/forms";
import { AvailabilityDayFullName } from "./data/step-2.data";

export interface IStepTwoForm {
  minCapacity: FormControl<number | null>;
  maxCapacity: FormControl<number | null>;
  slotDuration: FormControl<number | null>;
  minAge: FormControl<number | null>;
  maxAge: FormControl<number | null>;
  maxAgeChild: FormControl<number | null>;
  automaticValidation: FormControl<'Automatic' | 'Manual' | null>;
  childAllowedWithAdult: FormControl<'Yes' | 'No' | null>;
  address: FormControl<string | null>;
  zipcode: FormControl<string | null>;
  city: FormControl<string | null>;
  accessInfo: FormControl<string | null>;
  scheduledActivities: FormControl<IScheduledActivity[] | []>;
}

export interface IStepTwo {
  minCapacity: number | null;
  maxCapacity: number | null;
  slotDuration: number | null;
  minAge: number | null;
  maxAge: number | null;
  maxAgeChild: number | null;
  automaticValidation: 'Automatic' | 'Manual' | null;
  childAllowedWithAdult: 'Yes' | 'No' | null;
  address: string | null;
  zipcode: string | null;
  city: string | null;
  accessInfo: string | null;
  scheduledActivities: IScheduledActivity[];
}

export interface IScheduledActivity {
  id: string | undefined;
  selectedDays: AvailabilityDayFullName[];
  unavailabilityFrom: Date | undefined;
  unavailabilityTo: Date | undefined;
  availabilityFrom: Date; 
  availabilityTo: Date;
}