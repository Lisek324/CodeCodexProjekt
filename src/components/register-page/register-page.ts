import { Component, ElementRef, inject, NgZone, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { CredentialResponse } from 'google-one-tap';
import { environment } from '../../environments/environment';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-register-page',
  imports: [],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  @ViewChild('buttonDiv') buttonDiv!: ElementRef<HTMLDivElement>;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private _ngZone = inject(NgZone);
  private service = inject(AuthService);

  
  onSubmit() {
    // Handle form submission logic here
  }

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
  
    handleCredentialResponse(response: CredentialResponse){
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
}
