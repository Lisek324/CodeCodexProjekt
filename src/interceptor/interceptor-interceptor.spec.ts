import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { interceptorInterceptor } from './interceptor-interceptor';
import { of, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';

describe('interceptorInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => interceptorInterceptor(req, next));

  beforeEach(() => {
    authServiceMock = {
      getToken: vi.fn(),
      refreshToken: vi.fn(),
      setToken: vi.fn(),
      logout: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    });
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  let authServiceMock: {
    getToken: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
    setToken: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  it('should add Authorization header when token exists', async () => {
    authServiceMock.getToken.mockReturnValue('token-123');

    const req = new HttpRequest('GET', '/api/courses');

    await new Promise<void>((resolve) => {
      interceptor(req, (handledReq) => {
        expect(handledReq.headers.get('Authorization')).toBe('Bearer token-123');
        resolve();
        return of(new HttpResponse({ status: 200, body: [] }));
      }).subscribe();
    });
  });

  it('should set withCredentials for refresh request', async () => {
    authServiceMock.getToken.mockReturnValue('token-123');

    const req = new HttpRequest('POST', '/api/refresh', null);

    await new Promise<void>((resolve) => {
      interceptor(req, (handledReq) => {
        expect(handledReq.headers.has('Authorization')).toBe(false);
        expect(handledReq.withCredentials).toBe(true);
        return of(new HttpResponse({ status: 200, body: { accessToken: 'new-token' } }));
      }).subscribe({
        next: () => {
          resolve();
        },
      });
    });
  });
  it('should call refreshToken when request returns 401 and is not refresh request', () => {
    authServiceMock.getToken.mockReturnValue('old-token');
    authServiceMock.refreshToken.mockReturnValue(
      of({ accessToken: 'new-token' })
    );

    const req = new HttpRequest('GET', '/api/courses');

    interceptor(req, () =>
      throwError(() =>
        new HttpErrorResponse({
          status: 401,
          statusText: 'Unauthorized',
        })
      )
    ).subscribe({
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      next: () => { },
      error: (err) => {
        expect(err.status).toBe(401);
      },
    });

    expect(authServiceMock.refreshToken).toHaveBeenCalled();
  });
});
