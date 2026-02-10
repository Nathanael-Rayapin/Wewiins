import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { KeycloakService } from "./keycloak.service";
import { Observable, throwError } from "rxjs";
import { getStartOfDayToNowRange } from "../utils/date";
import { IDashboardDto } from "../dto/dashboard";

@Injectable({ providedIn: 'root' })
export class OrchestrationService {
    private BASE_URL = environment.api.url;

    private http = inject(HttpClient);
    private keycloakService = inject(KeycloakService);

    initializeDashboard(startRange: Date): Observable<IDashboardDto> {
        try {
            const email = this.keycloakService.getUserEmail();

            if (!email) {
                throw new Error('User email not found');
            }

            // Initialized to today
            const { startDate, endDate } = getStartOfDayToNowRange(startRange);

            return this.http.get<IDashboardDto>(`${this.BASE_URL}/orchestration/initialize`, {
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