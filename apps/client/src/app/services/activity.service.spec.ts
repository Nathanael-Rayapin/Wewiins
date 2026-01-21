import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import { KeycloakService } from "./keycloak.service";
import { ActivityService } from "./activity.service";

describe('Activity Service', () => {
    const BASE_URL = environment.api.url;

    let mainService: ActivityService;
    let keycloakService: KeycloakService;
    let httpTesting: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ActivityService,
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });

        mainService = TestBed.inject(ActivityService);
        keycloakService = TestBed.inject(KeycloakService);
        httpTesting = TestBed.inject(HttpTestingController);
    })

    it('should loadDashboardRevenue throw an error if user email is not found', async () => {
        const result$ = mainService.loadDashboardRevenue("aWeekAgo");
        await expect(firstValueFrom(result$)).rejects.toThrowError('User email not found');
    });

    it('should loadDashboardRevenue not throw an error if user email is found', async () => {
        environment.keycloak.enabled = true;

        vi.spyOn(keycloakService, 'getUserEmail').mockReturnValue('john.doe@test.com');

        const result$ = mainService.loadDashboardRevenue("aYearAgo");
        const resultPromise = firstValueFrom(result$);

        const req = httpTesting.expectOne(req =>
            req.method === 'GET' &&
            req.url === `${BASE_URL}/activity/revenue`
        );

        expect(req.request.params.get('email')).toBe('john.doe@test.com');

        req.flush([{ activity_offer_id: '123', activity_title: 'Karting', total_price: '29.99' }]);

        await expect(resultPromise).resolves.toBeDefined();

        httpTesting.verify();
    });
});