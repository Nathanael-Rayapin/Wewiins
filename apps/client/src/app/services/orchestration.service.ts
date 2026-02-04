import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { KeycloakService } from "./keycloak.service";
import { Observable, throwError } from "rxjs";
import { IDashboard } from "../dto/orchestrator";
import { getDateRange } from "../utils/date";
import { IDashboardStatsComparison } from "../dto/dashboard";

@Injectable({ providedIn: 'root' })
export class OrchestrationService {
    private BASE_URL = environment.api.url;

    private http = inject(HttpClient);
    private keycloakService = inject(KeycloakService);

    initializeDashboard(): Observable<IDashboard> {
        try {
            const email = this.keycloakService.getUserEmail();

            if (!email) {
                throw new Error('User email not found');
            }

            // Initialized to today
            const { startDate, endDate } = getDateRange(new Date());

            return this.http.get<IDashboard>(`${this.BASE_URL}/orchestration/initialize`, {
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

    initializeDashboardStats(startRange: Date): Observable<IDashboardStatsComparison> {        
        try {
            const email = this.keycloakService.getUserEmail();

            if (!email) {
                throw new Error('User email not found');
            }

            const { startDate, endDate } = getDateRange(startRange);

            return this.http.get<IDashboardStatsComparison>(`${this.BASE_URL}/orchestration/initialize/stats`, {
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