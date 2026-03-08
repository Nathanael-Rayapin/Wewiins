import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { dayOfWeekFullName } from "../step-2/data/step-2.data";

// ─── Moments ───────────────────────────────────────────────────────────────

export type MomentCode = 'ALL' | 'MORNING' | 'AFTERNOON' | 'EVENING';

export const MOMENT_LABELS: Record<MomentCode, string> = {
    ALL: 'Tout',
    MORNING: 'Matin',
    AFTERNOON: 'Après-midi',
    EVENING: 'Soirée'
};

// Terminals in minutes since midnight
export const MOMENT_BOUNDS: Record<Exclude<MomentCode, 'ALL'>, { from: number; to: number }> = {
    MORNING: { from: 0, to: 719 }, // 00:00 - 11:59
    AFTERNOON: { from: 720, to: 1080 }, // 12:00 - 18:00
    EVENING: { from: 1081, to: 1439 }  // 18:01 - 23:59
};

// ─── Structure calculée depuis la step 2 ───────────────────────────────────
// Represents one day with its moments deducted from step 2
export interface IDaySchedule {
    day: dayOfWeekFullName;
    availableMoments: MomentCode[];
}

// ─── Rates (reusable base) ────────────────────────────────────────────
export interface IRateFields {
    singleRate: number | null;
    adultRate: number | null;
    childRate: number | null;
    studentRate: number | null;
    twoPersonGroupRate: number | null;
}

export interface IRateFieldsForm {
    singleRate: FormControl<number | null>;
    adultRate: FormControl<number | null>;
    childRate: FormControl<number | null>;
    studentRate: FormControl<number | null>;
    twoPersonGroupRate: FormControl<number | null>;
}

// ─── Mode simple (switch OFF) ──────────────────────────────────────────────
export interface ISimplePricingForm extends IRateFieldsForm { }
export interface ISimplePricing extends IRateFields {
    singleRate: number | null;
    isAdultEnabled: boolean;
    isChildEnabled: boolean;
    isStudentEnabled: boolean;
    isGroup2Enabled: boolean;
}

// ─── Mode variable (switch ON) ─────────────────────────────────────────────

/**
 * A “rate slot” = a day with selected times
 * and associated rates.
 * If no times are selected → the rates apply to all times of the day.
 */
export interface IDayPricingForm extends IRateFieldsForm {
    day: FormControl<dayOfWeekFullName | null>;
    selectedMoment: FormControl<MomentCode>;
}

export interface IDayPricing extends IRateFields {
    day: dayOfWeekFullName | null;
    selectedMoment: MomentCode;
    singleRate: number | null;
    isAdultEnabled: boolean;
    isChildEnabled: boolean;
    isStudentEnabled: boolean;
    isGroup2Enabled: boolean;
}

export interface IVariablePricingForm {
    dayPricings: FormArray<FormGroup<IDayPricingForm>>;
}

export interface IVariablePricing {
    dayPricings: IDayPricing[];
}

// ─── Main form ──────────────────────────────────────────────────
/**
 * The active form is EITHER simplePricing OR variablePricing,
 * never both at the same time.
 * The component rebuilds the entire FormGroup each time the switch changes.
 */
export type IStepFourForm =
    | { isVariablePricing: FormControl<false>; pricing: FormGroup<ISimplePricingForm> }
    | { isVariablePricing: FormControl<true>; pricing: FormGroup<IVariablePricingForm> };

export interface IStepFour {
    isVariablePricing: boolean;
    simplePricing: ISimplePricing | null;
    variablePricing: IVariablePricing | null;
}

export interface IStepFourLoad {
    isVariablePricing: boolean | null;
    simplePricing: ISimplePricing | null;
    variablePricing: { dayPricings: IDayPricing[] | null } | null;
}