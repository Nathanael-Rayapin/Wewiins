import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { OrchestrationService } from '../../services/orchestration.service';
import { environment } from '../../../environments/environment';
import { KeycloakService } from '../../services/keycloak.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ActivityService } from '../../services/activity.service';
import { formatPrice } from '../../utils/price';

vi.mock(import('keycloak-js'), { spy: true })
vi.mock(import('../../services/keycloak.service'), { spy: true })

describe('Dashboard', () => {
  const BASE_URL = environment.api.url;

  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  let orchestrationService: OrchestrationService;
  let keycloakService: KeycloakService;
  let activityService: ActivityService;

  let httpTesting: HttpTestingController;
  let req: TestRequest;

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
    activityService = TestBed.inject(ActivityService);
    httpTesting = TestBed.inject(HttpTestingController);

    // Spy Keycloak Service
    vi.spyOn(keycloakService, 'userProfile').mockReturnValue({ email: 'john.doe@test.com' });
    vi.spyOn(keycloakService, 'isReady').mockReturnValue(true);

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

  describe('Chart and Revenues', () => {
    it('should init "revenues" with empty array when no revenues are available', () => {
      // Resolving the request
      req.flush({ revenue: [] });

      expect(component['revenues']()).empty;
    });

    it('should display "revenues" state when revenues are available', () => {
      const revenues = [{ activity_offer_id: '123', activity_title: 'Karting', total_price: 29.99 }];

      req.flush({ revenue: revenues });

      expect(component['revenues']()).toEqual(revenues);
      expect(component['revenues']()[0].activity_title).toBe('Karting');
    });

    it('should "chartRevenue" have default data = 100 when no revenues are available', () => {
      req.flush({ revenue: [] });

      const chartRevenueData = component['chartRevenue']().datasets[0].data;

      expect(chartRevenueData.length).toBe(1);
      expect(chartRevenueData[0]).toBe(100);
    });

    it('should "chartRevenue" have data = price when revenues are available', () => {
      const revenues = [{ activity_offer_id: '123', activity_title: 'Karting', total_price: 29.99 }];

      req.flush({ revenue: revenues });

      const chartRevenueData = component['chartRevenue']().datasets[0].data;

      expect(chartRevenueData.length).toBe(1);
      expect(chartRevenueData[0]).toBe(29.99);
    });

    // TODO: Canvas chart not displaying on a node testing environment
    it.todo('should update chart when date range changes', () => {
      // Flush previous request (initializeDashboard)
      req.flush({ revenue: [] });

      // Update DOM
      fixture.detectChanges();

      // This variable dosn't exist in the DOM because of loading and error state
      // that' why there are declared here after the request flush
      const selectOptionsDebug: DebugElement = fixture.debugElement;
      const selectOptions = selectOptionsDebug.query(By.css('p-select'));
      selectOptions.triggerEventHandler('onChange', { originalEvent: { target: { value: 'aMonthAgo' } } });

      // Mock HttpClient request for next request (trigger when date range changes)
      const newRequest = httpTesting.expectOne(req =>
        req.method === 'GET' &&
        req.url === `${BASE_URL}/activity/revenue`
      );

      // Flush actual request (loadDashboardRevenue)
      newRequest.flush([]);

      // console.log(component['selectedRange']());
      expect(component['selectedRange']()).toBe('aMonthAgo');
    });

    it('should set an error when loading revenues fails', async () => {
      //@deprecated — Http requests never emit an ErrorEvent. Please specify a ProgressEvent.
      req.error(new ProgressEvent('Oups'));

      expect(component.hasError()).toBe(true);
    });
  });

  describe('Get Total Revenue', () => {
    it('should calculate total and not add "K" when price is under 1000', () => {
      req.flush({
        revenue: [{
          activity_offer_id: '123',
          activity_title: 'Karting',
          total_price: 29.99
        }, {
          activity_offer_id: '456',
          activity_title: 'Skateboarding',
          total_price: 19.99
        }]
      });

      const revenues = component['revenues'];
      const total = String(Math.round(revenues().reduce((sum, revenue) => sum + revenue.total_price, 0)));

      expect(component['getTotalRevenue']()).toBe(total);
      expect(component['getTotalRevenue']()).not.toContain('K');
    });

    it('should calculate total and add "K" when price is over 1000', () => {
      req.flush({
        revenue: [{
          activity_offer_id: '123',
          activity_title: 'Karting',
          total_price: 500
        }, {
          activity_offer_id: '456',
          activity_title: 'Skateboarding',
          total_price: 600
        }]
      });

      const revenues = component['revenues'];
      const total = formatPrice(revenues().reduce((sum, revenue) => sum + revenue.total_price, 0));

      expect(component['getTotalRevenue']()).toBe(total);
      expect(component['getTotalRevenue']()).toContain('K');
    });
  });

});
