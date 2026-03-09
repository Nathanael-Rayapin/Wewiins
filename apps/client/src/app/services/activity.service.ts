import { inject, Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { sanitize } from "../utils/sanitize";
import { IStepOne } from "../pages/activity/steps/step-1/step-1.interface";
import { IActivityDraft, ImageType } from "../interfaces/activity";
import { IStepThree } from "../pages/activity/steps/step-3/step-3.interface";
import { StorageService } from "./storage.service";
import { IActivityDraftDto } from "../dto/activity";

@Injectable({ providedIn: 'root' })
export class ActivityService {
    private BASE_URL = environment.api.url;

    private http = inject(HttpClient);
    private storageService = inject(StorageService);

    saveDraft(draftData: IActivityDraft): Observable<{ activityId: string }> {
        try {
            const { activityId: storedId, step1: storedName } = this.storageService.getActivityDraftStorage();

            const activityName = storedName?.name?.trim() || draftData.step1?.name?.trim();

            if (!activityName && !storedId) {
                return throwError(() => new Error('Aucune activité identifiable — nom ou id requis'));
            }

            const step1Files = this.extractPhotos(draftData.step1);
            const step3Files = this.extractProgramImages(draftData.step3);

            const dataWithoutFiles: IActivityDraft = {
                step1: {
                    ...draftData.step1!,
                    name: activityName ?? draftData.step1?.name ?? null,
                    photos: step1Files.length > 0 ? null : draftData.step1?.photos ?? null,
                },
                step2: draftData.step2,
                step3: step3Files.length > 0
                    ? {
                        ...draftData.step3!,
                        program: draftData.step3!.program.map(p => ({ ...p, image: null as any }))
                    }
                    : draftData.step3,
                step4: draftData.step4
            };

            const formData = new FormData();

            formData.append('activityDraft', new Blob([JSON.stringify(dataWithoutFiles)], {
                type: 'application/json'
            }));

            if (storedId) {
                formData.append('activityId', storedId);
            }

            step1Files.forEach(file => formData.append('preview', file));
            step3Files.forEach(file => formData.append('program', file));

            return this.http.post<{ activityId: string }>(`${this.BASE_URL}/activity/draft`, formData);

        } catch (error) {
            return throwError(() => error);
        }
    }

    private extractPhotos(step1: IStepOne | null): File[] {
        return step1?.photos?.filter((file): file is File => file !== null) ?? [];
    }

    private extractProgramImages(step3: IStepThree | null): File[] {
        return step3?.program?.map(file => file.image).filter((img): img is File => img !== null) ?? [];
    }

    loadDraft(activityId?: string, activityName?: string): Observable<IActivityDraftDto> {
        const params: Record<string, string> = {};

        if (activityId) params['existingActivityId'] = activityId;
        if (activityName) params['existingActivityName'] = activityName;

        return this.http.get<IActivityDraftDto>(`${this.BASE_URL}/activity/draft/load`,
            { params }
        );
    }

    getImages(
        imageType: ImageType,
        activityName: string
    ): Observable<string[]> {
        try {
            return this.http.get<string[]>(`${this.BASE_URL}/activity/${sanitize(activityName)}/${imageType}/images`);
        } catch (error) {
            return throwError(() => error);
        }
    }

    getImagesNumber(
        imageType: ImageType,
        activityName: string
    ): Observable<number> {
        try {
            return this.http.get<number>(`${this.BASE_URL}/activity/${sanitize(activityName)}/${imageType}/images/count`);
        } catch (error) {
            return throwError(() => error);
        }
    }
}