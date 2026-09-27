import '@angular/compiler';
import { HttpClient, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { AuthService } from './auth.service';
import { HttpTokenInterceptor } from './http-token.interceptor';

describe('HttpTokenInterceptor', () => {
  it('adds the bearer token to protected requests', () => {
    localStorage.setItem('token', 'test-token');
    let interceptedRequest: HttpRequest<unknown> | undefined;
    const next: HttpHandler = {
      handle: (request) => {
        interceptedRequest = request;
        return of(new HttpResponse({ status: 200 }));
      }
    };
    const interceptor = new HttpTokenInterceptor(new AuthService(new HttpClient(next)));

    interceptor.intercept(new HttpRequest('GET', '/api/protected'), next).subscribe();

    expect(interceptedRequest?.headers.get('Authorization')).toBe('Bearer test-token');
    localStorage.removeItem('token');
  });
});
