import { FormControl } from "@angular/forms";
import { dayOfWeekFullName } from "./data/step-2.data";

export interface IStepTwoForm {
  minCapacity: FormControl<number | null>;
  maxCapacity: FormControl<number | null>;
  slotDurationMin: FormControl<number | null>;
  minAge: FormControl<number | null>;
  maxAge: FormControl<number | null>;
  minAgeChild: FormControl<number | null>;
  maxAgeChild: FormControl<number | null>;
  refundPolicy: FormControl<number | null>;
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
  slotDurationMin: number | null;
  minAge: number | null;
  maxAge: number | null;
  minAgeChild: number | null;
  maxAgeChild: number | null;
  refundPolicy: number | null;
  automaticValidation: boolean  | null;
  childAllowedWithAdult: boolean  | null;
  address: string | null;
  zipcode: string | null;
  city: string | null;
  accessInfo: string | null;
  scheduledActivities: IScheduledActivity[] | IScheduledActivityPayload[];
}

// UI
export interface IScheduledActivity {
  id: string | undefined;
  dayOfWeek: dayOfWeekFullName[];
  breakStart: Date | undefined;
  breakEnd: Date | undefined;
  openTime: Date | undefined;
  closeTime: Date | undefined;
}

// Backend Payload
export interface IScheduledActivityPayload {
    id: string | undefined;
    dayOfWeek: string[];
    openTime: string | null;
    closeTime: string | null;
    breakStart: string | null;
    breakEnd: string | null;
}