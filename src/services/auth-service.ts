import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';
import { jwtDecode } from 'jwt-decode';

export interface AuthResponse {
  accessToken: string;
  fullName: string;
  email: string;
  avatarUrl: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

type JwtPayload = {
  fullName?: string;
  email?: string;
  exp?: number;
  sub?: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private path = environment.apiUrl;
  private readonly tokenKey = 'accessToken';
  private readonly avatarKey = 'avatarUrl';

  httpClient = inject(HttpClient);
  header = new HttpHeaders().set('Content-type', 'application/json');

  private readonly _token = signal<string | null>(localStorage.getItem(this.tokenKey));
  private readonly _currentUser = signal<string | null>(
    this.getUserFromToken(localStorage.getItem(this.tokenKey))
  );
  private readonly _avatarUrl = signal<string | null>(localStorage.getItem(this.avatarKey));

  readonly currentUser = this._currentUser.asReadonly();
  readonly avatarUrl = this._avatarUrl.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());

  private getUserFromToken(token: string | null): string | null {
    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.fullName ?? null;
    } catch {
      return null;
    }
  }

  loginWithGoogle(credentials: string): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(`${this.path}google`, { credentials },{ withCredentials: true }).pipe(
      tap(response => {
        this.setToken(response.accessToken);

        if (response.avatarUrl) {
          localStorage.setItem(this.avatarKey, response.avatarUrl);
          this._avatarUrl.set(response.avatarUrl);
        } else {
          localStorage.removeItem(this.avatarKey);
          this._avatarUrl.set(null);
        }
      })
    );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(this.path + 'register', request, { headers: this.header, withCredentials: true }).pipe(
      tap(response => {
        this.setToken(response.accessToken);

        if (response.avatarUrl) {
          localStorage.setItem(this.avatarKey, response.avatarUrl);
          this._avatarUrl.set(response.avatarUrl);
        } else {
          localStorage.removeItem(this.avatarKey);
          this._avatarUrl.set(null);
        }
      })
    );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(this.path + 'login', request, { headers: this.header, withCredentials: true }).pipe(
      tap(response => {
        this.setToken(response.accessToken);

        if (response.avatarUrl) {
          localStorage.setItem(this.avatarKey, response.avatarUrl);
          this._avatarUrl.set(response.avatarUrl);
        } else {
          localStorage.removeItem(this.avatarKey);
          this._avatarUrl.set(null);
        }
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this._token.set(token);
    this._currentUser.set(this.getUserFromToken(token));
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.avatarKey);

    this._token.set(null);
    this._currentUser.set(null);
    this._avatarUrl.set(null);
  }

  getToken(): string | null {
    return this._token();
  }

  getCourses(): Observable<any[]> {
    return this.httpClient.get<any[]>(this.path + 'my-courses');
  }

  hasCourse(courseId: number): Observable<boolean> {
    return this.getCourses().pipe(
      map(courses => courses.some(course => course.id === courseId))
    );
  }

  buyCourse(courseId: number) {
    return this.httpClient.post<{ url: string }>(
      this.path + 'create-checkout-session',
      { courseId },
      { headers: this.header }
    );
  }

  refreshToken() {
    return this.httpClient.post<any>(
      `${this.path}refresh`,
      {},
      { withCredentials: true }
    );
  }
}