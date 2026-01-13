import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class OrchestrationService {
    private BASE_URL = environment.api.url;

    private http = inject(HttpClient);

    initializeDashboard() {

    }
}