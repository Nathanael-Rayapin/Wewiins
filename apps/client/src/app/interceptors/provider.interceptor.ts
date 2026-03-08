import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { KeycloakService } from "../services/keycloak.service";
import { environment } from "../../environments/environment";

export const providerInterceptor: HttpInterceptorFn = (req, next) => {
    const keycloakService = inject(KeycloakService);

    if (environment.keycloak.enabled === false) {
        return next(req);
    }

    const email = keycloakService.getUserEmail();

    if (!email) {
        console.error("❌ User email not found!");
        return next(req);
    }

    // 🔥 Backend need email as parameter for verified provider account
    const authReq = req.clone({
        setParams: {
            email: email
        }
    });

    return next(authReq);
};