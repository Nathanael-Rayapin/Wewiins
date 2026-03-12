import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { getStartOfDayToNowRange } from "../utils/date";
import { IReviewDto } from "../dto/review";

@Injectable({ providedIn: 'root' })
export class ReviewService {
    private BASE_URL = environment.api.url;

    private http = inject(HttpClient);

    initializeReview(
        startRange: Date,
        page: number,
        pageSize: number
    ): Observable<IReviewDto> {
        try {
            const { startDate, endDate } = getStartOfDayToNowRange(startRange);

            return this.http.get<IReviewDto>(`${this.BASE_URL}/review/initialize`, {
                params: {
                    startDate: startDate.toString(),
                    endDate: endDate.toString(),
                    page,
                    pageSize
                }
            });
        } catch (error) {
            return throwError(() => error);
        }
    }
}