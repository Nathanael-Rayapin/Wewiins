import { IStepOne } from "../pages/activity/steps/step-1/step-1.interface";
import { IStepTwo } from "../pages/activity/steps/step-2/step-2.interface";
import { IStepThree } from "../pages/activity/steps/step-3/step-3.interface";
import { IStepFour } from "../pages/activity/steps/step-4/step-4.interface";

export type ImageType = 'PREVIEW' | 'PROGRAM';

export interface IActivityDraft {
    step1: IStepOne | null;
    step2: IStepTwo | null;
    step3: IStepThree | null;
    step4: IStepFour | null;
}