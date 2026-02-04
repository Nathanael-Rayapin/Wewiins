import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { OrchestrationService } from '../../services/orchestration.service';
import { environment } from '../../../environments/environment';
import { KeycloakService } from '../../services/keycloak.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { Mock } from 'vitest';
import { IDashboardDto } from '../../dto/dashboard';
import { exampleResponse } from '../../services/orchestration.service.spec';

vi.mock(import('keycloak-js'), { spy: true })
vi.mock(import('../../services/keycloak.service'), { spy: true })

describe('Dashboard', () => {
    const BASE_URL = environment.api.url;

    let component: Dashboard;
    let fixture: ComponentFixture<Dashboard>;

    let orchestrationService: OrchestrationService;
    let keycloakService: KeycloakService;

    let httpTesting: HttpTestingController;
    let req: TestRequest;

    let spyInitializeDashboard: Mock<(startRange: Date) => Observable<IDashboardDto>>;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });

        // Initialize Services
        orchestrationService = TestBed.inject(OrchestrationService);
        keycloakService = TestBed.inject(KeycloakService);
        httpTesting = TestBed.inject(HttpTestingController);

        // Spy Keycloak Service
        vi.spyOn(keycloakService, 'userProfile').mockReturnValue({ email: 'john.doe@test.com' });
        vi.spyOn(keycloakService, 'isReady').mockReturnValue(true);

        spyInitializeDashboard = vi.spyOn(orchestrationService, 'initializeDashboard');

        fixture = TestBed.createComponent(Dashboard);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    beforeEach(() => {
        // Mock HttpClient
        req = httpTesting.expectOne(req =>
            req.method === 'GET' &&
            req.url === `${BASE_URL}/orchestration/initialize`
        );
    });

    afterEach(() => {
        httpTesting.verify();
    })

    describe('Effect Initialization', () => {
        it('should initializeDashboard be called when component is initialized', () => {
            req.flush(exampleResponse);
            expect(spyInitializeDashboard).toHaveBeenCalled();
        });

        it('should stats on dashboardStatsData updated when data are available', () => {
            req.flush(exampleResponse);

            component.dashboardStatsData().forEach(data => {
                switch (data.key) {
                    case 'totalRevenue':
                        expect(data.value.currentValue)
                            .toBe(exampleResponse.totalRevenue.currentValue);
                        break;

                    case 'totalBooking':
                        expect(data.value.currentValue)
                            .toBe(exampleResponse.totalBooking.currentValue);
                        break;

                    case 'totalVisit':
                        expect(data.value.currentValue)
                            .toBe(exampleResponse.totalVisit.currentValue);
                        break;

                    case 'averageScore':
                        expect(data.value.currentValue)
                            .toBe(exampleResponse.averageScore.currentValue);
                        break;
                }
            });
        });

        it('should table on dashboardTableData updated when data are available', () => {
            req.flush(exampleResponse);
            expect(component.dashboardTableData().length).toBe(exampleResponse.bookings.length);
        });
    });

});
