import { AfterViewInit, Component, ElementRef, inject, NgZone, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCard } from "@angular/material/card";
import { CredentialResponse } from "google-one-tap";
import { AuthService } from '../../services/auth-service';
import { isAwaitKeyword } from 'typescript';
import { environment } from '../../environments/environment';
import { finalize } from 'rxjs';

declare global {
  interface Window {
    onGoogleLibraryLoad: () => void;
    google: any;
  }
}

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule,RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage implements AfterViewInit {
@ViewChild('buttonDiv', { static: false }) buttonDiv!: ElementRef<HTMLDivElement>;
  loginError = signal<string>('');
  
  isSubmitted:boolean = false;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private _ngZone = inject(NgZone);
  private service = inject(AuthService);

  isSubmitting = signal(false);


  loginForm = this.fb.nonNullable.group({
    email: [''],
    password: [''],
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
      width: '320',
    });
  };

if (window.google?.accounts?.id) {
    window.onGoogleLibraryLoad();
  }
}

  async handleCredentialResponse(response: CredentialResponse){
  this.service.loginWithGoogle(response.credential).subscribe({
    next: (x: any) => {
      this.service.setToken(x.accessToken);
      this._ngZone.run(() => {
        this.router.navigate(['/dashboard']);
      });
    },
    error: (error: any) => {
      console.log(error);
    }
  });
}

  hasDisplayableError(controlName: string, errorName: string): boolean {
    const control = this.loginForm.get(controlName);
    return Boolean(control?.invalid) && (this.isSubmitted || Boolean(control?.touched))
  }

  onSubmit(): void {
    this.isSubmitting.set(true);
    this.loginError.set('');
    if(this.loginForm.valid) {
    this.service.login(this.loginForm.getRawValue())
    .pipe(finalize(() => this.isSubmitting.set(false)))
    .subscribe({
      next: (x: any) => {
        if (x.success) {
          this.service.setToken(x.accessToken);
          this.loginForm.reset();
          this.router.navigate(['/dashboard']);
        } else {
          this.loginError.set(x.message || 'Nie udało się zalogować.');
        }
      },
      error: (error: any) => {
        this.loginError.set(error?.error?.message || 'Nie udało się zalogować.');
      }
    });
  }
  }
}
