import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth-service';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let authServiceMock: {
    isLoggedIn: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    createUrlTree: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authServiceMock = {
      isLoggedIn: vi.fn(),
    };

    routerMock = {
      createUrlTree: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });
  function runGuard(url = '/dashboard') {
    const route = {} as any;
    const state = { url } as any;

    return TestBed.runInInjectionContext(() => authGuard(route, state));
  }

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
  it('should allow access when user is logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(true);

    const result = runGuard('/dashboard');

    expect(result).toBe(true);
    expect(authServiceMock.isLoggedIn).toHaveBeenCalled();
    expect(routerMock.createUrlTree).not.toHaveBeenCalled();
  });
  it('should redirect to login when user is not logged in', () => {
    const fakeUrlTree = {} as UrlTree;

    authServiceMock.isLoggedIn.mockReturnValue(false);
    routerMock.createUrlTree.mockReturnValue(fakeUrlTree);

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => { });

    const result = runGuard('/dashboard');

    expect(authServiceMock.isLoggedIn).toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith('Musisz się zalogować.');
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/dashboard' },
    });
    expect(result).toBe(fakeUrlTree);
  });
});
