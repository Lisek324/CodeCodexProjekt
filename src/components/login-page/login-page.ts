import { AfterViewInit, Component, ElementRef, inject, NgZone, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCard } from "@angular/material/card";
import { CredentialResponse } from "google-one-tap";
import { AuthService } from '../../services/auth-service';
import { isAwaitKeyword } from 'typescript';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    onGoogleLibraryLoad: () => void;
    google: any;
  }
}

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage implements AfterViewInit {
@ViewChild('buttonDiv') buttonDiv!: ElementRef<HTMLDivElement>;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private _ngZone = inject(NgZone);
  private service = inject(AuthService);

  isSubmitting = false;
  loginError = '';

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  ngAfterViewInit(): void {
  window.onGoogleLibraryLoad = () => {
    window.google.accounts.id.initialize({
      client_id: environment.clientId,
      callback: this.handleCredentialResponse.bind(this),
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.renderButton(this.buttonDiv.nativeElement, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 320
    });
  };

  if (window.google?.accounts?.id) {
    window.onGoogleLibraryLoad();
  }
}

  async handleCredentialResponse(response: CredentialResponse){
  this.service.LoginWithGoogle(response.credential).subscribe({
    next: (x: any) => {
      localStorage.setItem('token', x.token);
      this._ngZone.run(() => {
        this.router.navigate(['/dashboard']);
      });
    },
    error: (error: any) => {
      console.log(error);
    }
  });
}

  onSubmit(): void {
    
  }
}
