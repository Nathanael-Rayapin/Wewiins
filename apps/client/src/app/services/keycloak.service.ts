import { computed, Injectable, signal } from "@angular/core";
import { KeycloakProfile } from "keycloak-js";
import { environment } from "../../environments/environment";
import Keycloak from 'keycloak-js';
import { Router } from "@angular/router";

@Injectable({ providedIn: 'root' })
export class KeycloakService {
    private keycloak!: Keycloak;

    readonly userProfile = signal<KeycloakProfile | null>(null);
    readonly isInitialized = signal<boolean>(false);

    readonly isReady = computed(() => 
        this.isInitialized() && this.userProfile() !== null
    );

    constructor(private router: Router) { }

    async init(): Promise<boolean> {
        if (environment.keycloak.enabled === false) {
            this.isInitialized.set(true);
            return true;
        }

        this.keycloak = new Keycloak({
            url: environment.keycloak.url,
            realm: environment.keycloak.realm,
            clientId: environment.keycloak.clientId
        });

        this.keycloak.onAuthSuccess = async () => {
            const profile = await this.keycloak.loadUserProfile();
            this.isInitialized.set(true);
            this.userProfile.set(profile);
        };

        this.keycloak.onTokenExpired = () => {
            console.log("On Token Expired");
            
            // this.refreshToken().catch(() => {
            //     this.logout();
            // });
        };

        return this.keycloak.init({
            onLoad: 'login-required'
        });
    }

    getToken(): string | undefined {
        return this.keycloak.token;
    }

    getUserEmail(): string | undefined {
        return this.userProfile()?.email;
    }

    async refreshToken(): Promise<boolean> {
        if (!this.keycloak) return false;

        try {
            const refreshed = await this.keycloak.updateToken(30);
            if (refreshed) {
                console.log('Token refreshed successfully');
            };
            return refreshed;
        } catch (error) {
            console.error('Failed to refresh token', error);
            throw error;
        }
    }

    logout(): void {
        if (this.keycloak) {
            this.keycloak.logout({
                redirectUri: window.location.origin
            });
        } else {
            this.router.navigate(['/login']);
        }
    }
}