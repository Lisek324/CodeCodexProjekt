import { Component, ElementRef, inject, NgZone, signal, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CredentialResponse } from 'google-one-tap';
import { environment } from '../../environments/environment';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';
//import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPage {
  @ViewChild('buttonDiv') buttonDiv!: ElementRef<HTMLDivElement>;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private _ngZone = inject(NgZone);
  private service = inject(AuthService);
    isSubmitting = signal(false);

  isSubmitted:boolean = false;

passwordMatchValidator: ValidatorFn = (control: AbstractControl) => {
  const password = control.get('password')?.value;
  const confirmPasswordControl = control.get('confirmPassword');

  if (!confirmPasswordControl) return null;

  if (password && confirmPasswordControl.value && password !== confirmPasswordControl.value) {
    confirmPasswordControl.setErrors({ ...confirmPasswordControl.errors, passwordMismatch: true });
  } else {
    const errors = confirmPasswordControl.errors;
    if (errors?.['passwordMismatch']) {
      delete errors['passwordMismatch'];
      confirmPasswordControl.setErrors(Object.keys(errors).length ? errors : null);
    }
  }

  return null;
};

  form = this.fb.group({
    fullName: ['', [Validators.required]],// lub nazwa użytkownika
    email: ['', [Validators.required,Validators.email]],
    password: ['', [Validators.required,Validators.minLength(6),Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });


  onSubmit() {
    this.isSubmitted = true;
    this.isSubmitting.set(true);
    if(this.form.valid) {
      this.service.register(this.form.value).subscribe({
        next: (x: any) => {
          if(x.success){
          localStorage.setItem('token', x.token);
          this.isSubmitted = false;
          this.isSubmitting.set(false);
          this.form.reset();
          this.router.navigate(['/dashboard']);
          }else {
             console.log(x.message);
          }
        },
        error: (error: any) => {
          console.log(error);
          console.log('error body:', error.error);
          this.isSubmitting.set(false);
        }
      });
  }
  this.isSubmitting.set(false);
}

  hasDisplayableError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return Boolean(control?.invalid) && (this.isSubmitted || Boolean(control?.touched))
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
        text: 'signup_with',
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
        //localStorage.setItem('token', x.token);
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
