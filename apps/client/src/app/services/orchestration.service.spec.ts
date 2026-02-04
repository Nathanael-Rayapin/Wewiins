import { TestBed } from "@angular/core/testing";
import { OrchestrationService } from "./orchestration.service";
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { firstValueFrom } from "rxjs";
import { environment } from "../../environments/environment";
import { KeycloakService } from "./keycloak.service";
import { IDashboardDto } from "../dto/dashboard";
import { defaultStats } from "../pages/dashboard/data/dashboard.data";
import { BookingStatus } from "../interfaces/booking-status";

export const exampleResponse: IDashboardDto = {
    totalRevenue: { ...defaultStats },
    totalBooking: { ...defaultStats },
    totalVisit: { ...defaultStats },
    averageScore: { ...defaultStats },
    filterRangeDays: 3,
    bookings:
        [
            {
                id: "c96827e5-f98c-4c12-986f-737d635a44c5",
                reference: "961D020226U6Z9",
                name: "Levine Maillot",
                date: "2026-02-08",
                startTime: null,
                endTime: null,
                participants: 2,
                title: "ATV Legends",
                totalPrice: 999.99,
                status: BookingStatus.COMING_SOON
            },
            {
                id: "743d83e5-d0e6-4a31-93dd-a46b2f6a9b2f",
                reference: "7A1C110924Q4L8",
                name: "Luna Aubry",
                date: "2026-02-08",
                startTime: "2026-02-08T06:00:00Z",
                endTime: "2026-02-08T14:00:00Z",
                participants: 1,
                title: "Les Sentiers Secrets du Vercors",
                totalPrice: 40,
                status: BookingStatus.CANCEL
            }
        ],
    isRevenueCompletelyLoad: true
};

describe('Orchestration Service', () => {
    const BASE_URL = environment.api.url;

    let orchestrationService: OrchestrationService;
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

        orchestrationService = TestBed.inject(OrchestrationService);
        keycloakService = TestBed.inject(KeycloakService);
        httpTesting = TestBed.inject(HttpTestingController);
    })

    it('should initializeDashboard throw an error if user email is not found', async () => {
        const result$ = orchestrationService.initializeDashboard(new Date());
        await expect(firstValueFrom(result$)).rejects.toThrowError('User email not found');
    });

    it('should initializeDashboard not throw an error if user email is found', async () => {
        environment.keycloak.enabled = true;

        vi.spyOn(keycloakService, 'getUserEmail').mockReturnValue('john.doe@test.com');

        const result$ = orchestrationService.initializeDashboard(new Date());
        const resultPromise = firstValueFrom(result$);

        const req = httpTesting.expectOne(req =>
            req.method === 'GET' &&
            req.url === `${BASE_URL}/orchestration/initialize`
        );

        expect(req.request.params.get('email')).toBe('john.doe@test.com');

        req.flush(exampleResponse);

        await expect(resultPromise).resolves.toBeDefined();

        httpTesting.verify();
    });
});