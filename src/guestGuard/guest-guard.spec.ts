import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router, UrlTree } from '@angular/router';

import { guestGuard } from './guest-guard';
import { AuthService } from '../services/auth-service';

describe('guestGuard', () => {
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
  function runGuard(url = '/login') {
    const route = {} as any;
    const state = { url } as any;

    return TestBed.runInInjectionContext(() => guestGuard(route, state));
  }

   it('should allow access when user is not logged in', () => {
    authServiceMock.isLoggedIn.mockReturnValue(false);

    const result = runGuard('/login');

    expect(authServiceMock.isLoggedIn).toHaveBeenCalled();
    expect(result).toBe(true);
    expect(routerMock.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to dashboard when user is logged in', () => {
    const fakeUrlTree = {} as UrlTree;

    authServiceMock.isLoggedIn.mockReturnValue(true);
    routerMock.createUrlTree.mockReturnValue(fakeUrlTree);

    const result = runGuard('/register');

    expect(authServiceMock.isLoggedIn).toHaveBeenCalled();
    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).toBe(fakeUrlTree);
  });
});
