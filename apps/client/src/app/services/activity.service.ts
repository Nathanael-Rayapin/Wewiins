import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { KeycloakService } from "./keycloak.service";
import { Observable, throwError } from "rxjs";
import { IActivityRevenue } from "../dto/activity";
import { getDateRange } from "../utils/date";
import { IDateFrom } from "../interfaces/date";

@Injectable({ providedIn: 'root' })
export class ActivityService {
    private BASE_URL = environment.api.url;

    private http = inject(HttpClient);
    private keycloakService = inject(KeycloakService);

    loadDashboardRevenue(dateFrom: IDateFrom): Observable<IActivityRevenue[]> {
        try {
            const email = this.keycloakService.getUserEmail();

            if (!email) {
                throw new Error('User email not found');
            }

            const { startDate, endDate } = getDateRange(dateFrom);

            return this.http.get<IActivityRevenue[]>(`${this.BASE_URL}/activity/revenue`, {
                params: {
                    email,
                    startDate: startDate.toString(),
                    endDate: endDate.toString()
                }
            });
        } catch (error) {
            return throwError(() => error);
        }
    }
}