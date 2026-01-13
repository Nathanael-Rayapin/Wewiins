import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { KeycloakService } from "../services/keycloak.service";
import { environment } from "../../environments/environment";
import { from, switchMap, catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const keycloakService = inject(KeycloakService);

    // Si Keycloak est désactivé en local, on ne fait rien
    if (environment.keycloak.enabled === false) {
        return next(req);
    }

    return from(keycloakService.refreshToken()).pipe(
        switchMap(() => {
            const authReq = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${keycloakService.getToken()}`
                }
            });

            return next(authReq);
        }),
        catchError((error) => {
            keycloakService.logout();
            return throwError(() => error);
        })
    );
};