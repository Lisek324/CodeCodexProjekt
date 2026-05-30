import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

export const interceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const service = inject(AuthService);
const isRefreshRequest = req.url.includes('/refresh');
  const token = localStorage.getItem('accessToken') ?? "";
  req = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  let authReq = req;
  if (isRefreshRequest) {
    authReq = req.clone({ withCredentials: true });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isRefreshRequest) {
        return service.refreshToken().pipe(
          switchMap((response: any) => {
            localStorage.setItem('authToken', response.accessToken);
            localStorage.setItem('fullName', response.fullName);
            localStorage.setItem('email', response.email);

            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.accessToken}`
              }
            });

            return next(retryReq);
          }),
          catchError(refreshError => {
            service.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
