import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';

export const interceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const service = inject(AuthService);

  const token = localStorage.getItem('accessToken') ?? "";
  req = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  // Przekazuje zmodyfikowane żądanie dalej.
  return next(req);
};
