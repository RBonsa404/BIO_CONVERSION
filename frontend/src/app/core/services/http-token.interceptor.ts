import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();

    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Session expirée ou révoquée : retour à la connexion, puis à la page demandée.
        // Un 401 sur la connexion elle-même est une simple erreur d'identifiants.
        if (error.status === 401 && !request.url.includes('/auth/login')) {
          this.authService.logout();
          const url = this.router.url;
          if (!url.startsWith('/connexion')) {
            this.router.navigate(['/connexion'], {
              queryParams: { session: 'expiree', retour: url }
            });
          }
        }
        return throwError(() => error);
      })
    );
  }
}
