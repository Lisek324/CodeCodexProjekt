import { TestBed } from '@angular/core/testing';

import { AuthService, LoginRequest, RegisterRequest } from './auth-service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../environments/environment';
import { jwtDecode } from 'jwt-decode';
describe('AuthService', () => {

  let httpMock: HttpTestingController;
  let service: AuthService;
  vi.mock('jwt-decode', () => ({
    jwtDecode: vi.fn(),
  }));
  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set token and update auth state', async () => {
  vi.mocked(jwtDecode).mockReturnValue({ fullName: 'Jan Kowalski' } as any);

  const token = 'fake-jwt-token';
  service.setToken(token);

  expect(localStorage.getItem('accessToken')).toBe(token);
  expect(service.getToken()).toBe(token);
  expect(service.isLoggedIn()).toBe(true);
  expect(service.currentUser()).toBe('Jan Kowalski');
  });

  it('should return null currentUser when token decode fails', async () => {
    const { jwtDecode } = await import('jwt-decode');
    (jwtDecode as any).mockImplementation(() => {
      throw new Error('invalid token');
    });

    const token = 'bad-token';
    service.setToken(token);

    expect(service.currentUser()).toBeNull();
  });

  it('should logout and clear auth state', () => {
    localStorage.setItem('accessToken', 'token');
    localStorage.setItem('avatarUrl', 'avatar.png');

    service.logout();

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('avatarUrl')).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(service.avatarUrl()).toBeNull();
  });

  it('should login and store token with avatar', () => {
    const request: LoginRequest = {
      email: 'test@test.com',
      password: 'secret',
    };

    const response = {
      accessToken: 'jwt-token',
      fullName: 'Jan Kowalski',
      email: 'test@test.com',
      avatarUrl: 'https://example.com/avatar.png',
    };

    service.login(request).subscribe(res => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(environment.apiUrl + 'login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    expect(req.request.withCredentials).toBe(true);

    req.flush(response);

    expect(localStorage.getItem('accessToken')).toBe('jwt-token');
    expect(localStorage.getItem('avatarUrl')).toBe('https://example.com/avatar.png');
    expect(service.avatarUrl()).toBe('https://example.com/avatar.png');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should register and store token with avatar', () => {
    const request: RegisterRequest = {
      email: 'test@test.com',
      password: 'secret',
      fullName: 'Jan Kowalski',
    };

    const response = {
      accessToken: 'jwt-token',
      fullName: 'Jan Kowalski',
      email: 'test@test.com',
      avatarUrl: 'https://example.com/avatar.png',
    };

    service.register(request).subscribe(res => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(environment.apiUrl + 'register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    expect(req.request.withCredentials).toBe(true);

    req.flush(response);

    expect(localStorage.getItem('avatarUrl')).toBe('https://example.com/avatar.png');
    expect(service.avatarUrl()).toBe('https://example.com/avatar.png');
  });

  it('should loginWithGoogle and store token with avatar', () => {
    const response = {
      accessToken: 'jwt-token',
      fullName: 'Jan Kowalski',
      email: 'test@test.com',
      avatarUrl: 'https://example.com/avatar.png',
    };

    service.loginWithGoogle('google-credential').subscribe(res => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}google`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ credentials: 'google-credential' });
    expect(req.request.withCredentials).toBe(true);

    req.flush(response);

    expect(localStorage.getItem('accessToken')).toBe('jwt-token');
    expect(localStorage.getItem('avatarUrl')).toBe('https://example.com/avatar.png');
  });

  it('should get courses', () => {
    const courses = [
      { id: 1, title: 'Angular' },
      { id: 2, title: 'ASP.NET' },
    ];

    service.getCourses().subscribe(res => {
      expect(res).toEqual(courses);
    });

    const req = httpMock.expectOne(environment.apiUrl + 'my-courses');
    expect(req.request.method).toBe('GET');

    req.flush(courses);
  });

  it('should return true when user has course', () => {
    const courses = [{ id: 1 }, { id: 2 }];

    service.hasCourse(2).subscribe(res => {
      expect(res).toBe(true);
    });

    const req = httpMock.expectOne(environment.apiUrl + 'my-courses');
    req.flush(courses);
  });

  it('should return false when user does not have course', () => {
    const courses = [{ id: 1 }];

    service.hasCourse(2).subscribe(res => {
      expect(res).toBe(false);
    });

    const req = httpMock.expectOne(environment.apiUrl + 'my-courses');
    req.flush(courses);
  });

  it('should buy course', () => {
    const response = { url: 'https://checkout.stripe.com/session/123' };

    service.buyCourse(5).subscribe(res => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(environment.apiUrl + 'create-checkout-session');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ courseId: 5 });

    req.flush(response);
  });

  it('should refresh token', () => {
    const response = { accessToken: 'new-token' };

    service.refreshToken().subscribe(res => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}refresh`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);

    req.flush(response);
  });
});