import { TestBed } from "@angular/core/testing";
import { OrchestrationService } from "./orchestration.service";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import { KeycloakService } from "./keycloak.service";

describe('Orchestration Service', () => {
    const BASE_URL = environment.api.url;

    let mainService: OrchestrationService;
    let keycloakService: KeycloakService;
    let httpTesting: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                OrchestrationService,
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });

        mainService = TestBed.inject(OrchestrationService);
        keycloakService = TestBed.inject(KeycloakService);
        httpTesting = TestBed.inject(HttpTestingController);
    })

    it('should initializeDashboard throw an error if user email is not found', async () => {
        const result$ = mainService.initializeDashboard();
        await expect(firstValueFrom(result$)).rejects.toThrowError('User email not found');
    });

    it('should initializeDashboard not throw an error if user email is found', async () => {
        environment.keycloak.enabled = true;

        vi.spyOn(keycloakService, 'getUserEmail').mockReturnValue('john.doe@test.com');

        const result$ = mainService.initializeDashboard();
        const resultPromise = firstValueFrom(result$);

        const req = httpTesting.expectOne(req =>
            req.method === 'GET' &&
            req.url === `${BASE_URL}/orchestration/initialize`
        );

        expect(req.request.params.get('email')).toBe('john.doe@test.com');

        req.flush({
            revenue: [{ activity_title: 'Karting', total_price: '29.99' }]
        });

        await expect(resultPromise).resolves.toBeDefined();

        httpTesting.verify();
    });
});