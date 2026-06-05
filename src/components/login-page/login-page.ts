import { AfterViewInit, Component, ElementRef, inject, NgZone, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CredentialResponse } from "google-one-tap";
import { AuthResponse, AuthService } from '../../services/auth-service';
import { environment } from '../../environments/environment';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

declare global {
  interface Window {
    onGoogleLibraryLoad: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
  }
}

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage implements AfterViewInit {
  @ViewChild('buttonDiv', { static: false }) buttonDiv!: ElementRef<HTMLDivElement>;
  loginError = signal<string>('');

  isSubmitted = false;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private _ngZone = inject(NgZone);
  private service = inject(AuthService);

  isSubmitting = signal(false);


  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
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
  handleCredentialResponse(response: CredentialResponse) {
    this.loginError.set('');
    this.isSubmitting.set(true);

    this.service.loginWithGoogle(response.credential)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (x: AuthResponse) => {
          console.log('google login response:', x);
          this.service.setToken(x.accessToken);

          this._ngZone.run(() => {
            this.router.navigate(['/dashboard']);
          });
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);
          this.loginError.set(error?.error?.message || 'Nie udało się zalogować przez Google.');
        }
      });
  }

  hasDisplayableError(controlName: string): boolean {
    const control = this.loginForm.get(controlName);

    return Boolean(control?.invalid) &&
      (this.isSubmitted || Boolean(control?.touched));
  }

  onSubmit(): void {
    this.isSubmitted = true;
    this.loginError.set('');

    if (this.loginForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);

    this.service.login(this.loginForm.getRawValue())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (x: AuthResponse) => {
          console.log('login response:', x);
            this.service.setToken(x.accessToken);
            this.loginForm.reset();

            this._ngZone.run(() => {
              this.router.navigate(['/dashboard']);
            });
        },
        error: (error: HttpErrorResponse) => {
          this.loginError.set(error?.error?.message || 'Nie udało się zalogować.');
        }
      });
  }
}
