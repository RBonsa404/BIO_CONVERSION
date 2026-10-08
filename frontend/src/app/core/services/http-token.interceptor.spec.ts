import '@angular/compiler';
import { HttpClient, HttpErrorResponse, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { HttpTokenInterceptor } from './http-token.interceptor';

/** Jeton au format JWT, non signé, expirant dans une heure. */
function jetonValide(): string {
  const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
  return `en-tete.${payload}.signature`;
}

function routeur(url = '/marketplace') {
  return { url, navigate: vi.fn() } as unknown as Router & { navigate: ReturnType<typeof vi.fn> };
}

describe('HttpTokenInterceptor', () => {
  afterEach(() => localStorage.clear());

  it('adds the bearer token to protected requests', () => {
    const token = jetonValide();
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify({ idUtilisateur: 3, role: 'ELEVEUR' }));
    let interceptedRequest: HttpRequest<unknown> | undefined;
    const next: HttpHandler = {
      handle: (request) => {
        interceptedRequest = request;
        return of(new HttpResponse({ status: 200 }));
      }
    };
    const interceptor = new HttpTokenInterceptor(new AuthService(new HttpClient(next)), routeur());

    interceptor.intercept(new HttpRequest('GET', '/api/protected'), next).subscribe();

    expect(interceptedRequest?.headers.get('Authorization')).toBe(`Bearer ${token}`);
  });

  it('écarte au démarrage une session dont le jeton a expiré', () => {
    const expire = `en-tete.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 60 }))}.signature`;
    localStorage.setItem('token', expire);
    localStorage.setItem('currentUser', JSON.stringify({ idUtilisateur: 3, role: 'ELEVEUR' }));
    const next: HttpHandler = { handle: () => of(new HttpResponse({ status: 200 })) };

    const authService = new AuthService(new HttpClient(next));

    expect(authService.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('ferme la session et renvoie vers la connexion sur un 401', () => {
    localStorage.setItem('token', jetonValide());
    localStorage.setItem('currentUser', JSON.stringify({ idUtilisateur: 3, role: 'ELEVEUR' }));
    const next: HttpHandler = {
      handle: () => throwError(() => new HttpErrorResponse({ status: 401 }))
    };
    const authService = new AuthService(new HttpClient(next));
    const router = routeur('/mes-commandes');
    const interceptor = new HttpTokenInterceptor(authService, router);
    expect(authService.isAuthenticated()).toBe(true);

    interceptor.intercept(new HttpRequest('GET', '/api/v1/marketplace/produits'), next).subscribe({ error: () => {} });

    expect(authService.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/connexion'], {
      queryParams: { session: 'expiree', retour: '/mes-commandes' }
    });
  });

  it('laisse la page de connexion afficher une erreur d’identifiants', () => {
    const next: HttpHandler = {
      handle: () => throwError(() => new HttpErrorResponse({ status: 401 }))
    };
    const router = routeur('/connexion');
    const interceptor = new HttpTokenInterceptor(new AuthService(new HttpClient(next)), router);

    interceptor.intercept(new HttpRequest('POST', '/api/v1/auth/login', {}), next).subscribe({ error: () => {} });

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
