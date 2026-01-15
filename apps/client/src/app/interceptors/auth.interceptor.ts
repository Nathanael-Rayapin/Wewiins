import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { KeycloakService } from "../services/keycloak.service";
import { environment } from "../../environments/environment";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const keycloakService = inject(KeycloakService);

    // Si Keycloak est désactivé en local, on ne fait rien
    if (environment.keycloak.enabled === false) {
        return next(req);
    }

    const token = keycloakService.getToken();

    console.log("🔶 authInterceptor - URL:", req.url);
    console.log("🔶 Token:", token ? "YES (length: " + token.length + ")" : "NO");

    if (!token) {
        console.error("❌ No token available!");
        return next(req);
    }

    // 🔥 Clone la requête avec le header Authorization
    const authReq = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });

    console.log("✅ Authorization header added:", authReq.headers.get('Authorization')?.substring(0, 30) + "...");

    return next(authReq);
};