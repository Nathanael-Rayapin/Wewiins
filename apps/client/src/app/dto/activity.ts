import { IActivityDraft } from "../interfaces/activity";

export interface IActivityDraftDto extends IActivityDraft {
    activityId: string | null;
}