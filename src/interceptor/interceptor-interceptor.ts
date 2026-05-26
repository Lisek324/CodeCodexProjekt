import { HttpInterceptorFn } from '@angular/common/http';

export const interceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('authToken') ?? "";
  req = req.clone({
    setHeaders: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  });
  // Przekazuje zmodyfikowane żądanie dalej.
  return next(req);
};
