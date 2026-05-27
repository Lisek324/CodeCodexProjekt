import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

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
@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private path = environment.apiUrl;
  private readonly tokenKey = 'accessToken'
  private readonly avatarKey = 'avatarUrl';
  private readonly _token = signal<string | null>(localStorage.getItem(this.tokenKey));;
  httpClient = inject(HttpClient);
  private readonly _avatarUrl = signal<string | null>(localStorage.getItem(this.avatarKey));
  readonly avatarUrl = this._avatarUrl.asReadonly();

  header = new HttpHeaders().set('Content-type','application/json');
  
loginWithGoogle(credentials: string): Observable<AuthResponse> {
  return this.httpClient.post<AuthResponse>(`${this.path}google`, { credentials }).pipe(
    tap(response => {
      this.setToken(response.accessToken);
      this._avatarUrl.set(response.avatarUrl);
      if (response.avatarUrl) {
      localStorage.setItem(this.avatarKey, response.avatarUrl);
      this._avatarUrl.set(response.avatarUrl);
  }
    })
  );
}

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(this.path+"register", request,{headers:this.header}).pipe(
      tap(response => {
        this.setToken(response.accessToken);
        this._avatarUrl.set(response.avatarUrl);
      })
    );
  }

  login(request:LoginRequest): Observable<AuthResponse> {
    return this.httpClient.post<AuthResponse>(this.path+"login", request,{headers:this.header}).pipe(
      tap(response => {
        this.setToken(response.accessToken);
        this._avatarUrl.set(response.avatarUrl);
      })
    );
  }
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this._token.set(token);
  }
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this._token.set(null);
    this._avatarUrl.set(null);
  }
  getToken(): string | null {
    return this._token();
  }
  readonly isLoggedIn = computed(() => !!this._token());
  getCourses(){
    return this.httpClient.get(this.path+"my-courses");
  }
  buyCourse(courseId: number){
    return this.httpClient.post<{url:string}>(this.path+"create-checkout-session",{courseId},{headers:this.header});
  }
}
