import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { getStartOfDayToNowRange } from "../utils/date";
import { IStatisticDto } from "../dto/statistic";

@Injectable({ providedIn: 'root' })
export class StatisticService {
    private BASE_URL = environment.api.url;

    private http = inject(HttpClient);

    initializeStatistic(startRange: Date): Observable<IStatisticDto> {
        try {
            const { startDate, endDate } = getStartOfDayToNowRange(startRange);

            return this.http.get<IStatisticDto>(`${this.BASE_URL}/statistic/initialize`, {
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