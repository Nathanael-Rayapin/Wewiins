import { provideRouter } from "@angular/router";
import { KeycloakService } from "./keycloak.service";
import { TestBed } from "@angular/core/testing";
import { environment } from "../../environments/environment";

vi.mock('keycloak-js', () => {
    return {
        default: class {
            init = vi.fn().mockResolvedValue(true);
            onAuthSuccess: any;
            loadUserProfile = vi.fn().mockResolvedValue({ email: 'john.doe@test.com' });
        }
    };
});

describe('Keycloak Service', () => {

    TestBed.configureTestingModule({
        providers: [KeycloakService, provideRouter([])],
    });

    const mainService = TestBed.inject(KeycloakService);

    it('should isInitialized return true with keycloak.enabled === false', async () => {
        environment.keycloak.enabled = false;

        const result = await mainService.init();

        expect(mainService.isInitialized()).toBe(true);
        expect(result).toBe(true);
    })

    it('should isInitialized return true if onAuthSuccess is triggered', async () => {
        environment.keycloak.enabled = true;

        await mainService.init();

        await mainService['keycloak'].onAuthSuccess!();

        expect(mainService.isInitialized()).toBe(true);
    });

    it('should load user profile if onAuthSuccess is triggered', async () => {
        environment.keycloak.enabled = true;

        await mainService.init();

        await mainService['keycloak'].onAuthSuccess!();

        expect(mainService.userProfile()).not.toBeNull();
    });

    it('should isInitialized return true even if loadUserProfile fails', async () => {
        environment.keycloak.enabled = true;

        await mainService.init();

        mainService['keycloak'].loadUserProfile = vi.fn().mockRejectedValue(new Error('Oups'));

        await mainService['keycloak'].onAuthSuccess!();

        expect(mainService.isInitialized()).toBe(true);
    });

    it('should get user email after load user profile', async () => {
        environment.keycloak.enabled = true;

        await mainService.init();

        await mainService['keycloak'].onAuthSuccess!();

        const result = await mainService.getUserEmail();

        expect(result).toBe('john.doe@test.com');
    });
});
