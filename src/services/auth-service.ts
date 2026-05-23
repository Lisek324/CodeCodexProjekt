import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private path = environment.apiUrl;
  httpClient = inject(HttpClient);
  
  LoginWithGoogle(credentials:string):Observable<any>{
    const header = new HttpHeaders().set('Content-type','application/json');
    return this.httpClient.post(this.path+"LoginWithGoogle", JSON.stringify(credentials),{headers:header})
  }
}
