import { Injectable } from "@angular/core";
import { IActivityDraftStorage } from "../interfaces/storage";

@Injectable({ providedIn: 'root' })
export class StorageService {
    getActivityDraftStorage(): IActivityDraftStorage {
        const stored = this.getItem<{ activityId?: string, step1?: { name?: string } }>('activityDraft');
        const storedName = stored?.step1?.name;
        const storedId = stored?.activityId;

        return {
            activityId: storedId ?? undefined,
            step1: {
                name: storedName ?? undefined
            }
        }
    }

    setItem<T>(key: string, value: T): void {
        localStorage.setItem(key, JSON.stringify(value));
    }

    getItem<T>(key: string): T | null {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) as T : null;
    }

    mergeItem<T extends object>(key: string, partial: Partial<T>): void {
        const existing = this.getItem<T>(key) ?? {} as T;

        const merged = {
            ...existing,
            ...partial
        };

        this.setItem(key, merged);
    }

    removeItem(key: string): void {
        localStorage.removeItem(key);
    }
}