import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { getStartOfDayToNowRange } from "../utils/date";
import { IDashboardDto } from "../dto/dashboard";

@Injectable({ providedIn: 'root' })
export class StatisticService {
    private BASE_URL = environment.api.url;

    private http = inject(HttpClient);

    initializeStatistic(startRange: Date) {
        try {
            // Initialized to today
            const { startDate, endDate } = getStartOfDayToNowRange(startRange);

            return this.http.get<IDashboardDto>(`${this.BASE_URL}/statistic/initialize`, {
                params: {
                    startDate: startDate.toString(),
                    endDate: endDate.toString()
                }
            });
        } catch (error) {
            return throwError(() => error);
        }
    }
}