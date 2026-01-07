import { Injectable, signal } from "@angular/core";
import { KeycloakProfile } from "keycloak-js";
import { environment } from "../../environments/environment";
import Keycloak from 'keycloak-js';

@Injectable({ providedIn: 'root' })
export class KeycloakService {
    private keycloak!: Keycloak;

    readonly userProfile = signal<KeycloakProfile | null>(null);

    async init(): Promise<boolean> {
        if (environment.keycloak.enabled === false) {
            // ✅ Angular démarre directement en local
            return true;
        }

        this.keycloak = new Keycloak({
            url: environment.keycloak.url,
            realm: environment.keycloak.realm,
            clientId: environment.keycloak.clientId
        });
        
        this.keycloak.onAuthSuccess = async () => {
            const profile = await this.keycloak.loadUserProfile();
            this.userProfile.set(profile);
        };

        this.keycloak.onAuthLogout = () => {
            this.userProfile.set(null);
        };

        return this.keycloak.init({
            onLoad: 'login-required'
        });
    }
}