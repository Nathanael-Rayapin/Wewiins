import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { KeycloakService } from "./keycloak.service";
import { Observable } from "rxjs";
import { IOrchestratorResponse } from "../dto/orchestrator";
import { getDateRange } from "../utils/date";

@Injectable({ providedIn: 'root' })
export class OrchestrationService {
    private BASE_URL = environment.api.url;

    private http = inject(HttpClient);
    private keycloakService = inject(KeycloakService);

    initializeDashboard(): Observable<IOrchestratorResponse> {
        const email = this.keycloakService.getUserEmail();
        
        if (!email) {
            throw new Error('User email not found');
        }

        // Initialized to one week from yesteday
        const { startDate, endDate } = getDateRange("aWeekAgo");

        // The token will be automatically added by the interceptor
        return this.http.get<IOrchestratorResponse>(`${this.BASE_URL}/orchestration/initialize`, {
            params: {
                email,
                startDate: startDate.toString(),
                endDate: endDate.toString()
            }
        });
    }
}