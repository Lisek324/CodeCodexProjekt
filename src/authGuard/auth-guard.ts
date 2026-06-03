import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const service = inject(AuthService);
  const router = inject(Router);
  if (service.isLoggedIn()) {
    return true;
  } else {
    alert("Musisz się zalogować.");
  }
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
