import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
private fb = inject(FormBuilder);
  private router = inject(Router);

  isSubmitting = false;
  loginError = '';

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.loginError = '';

    const credentials = this.loginForm.getRawValue();

    setTimeout(() => {
      this.isSubmitting = false;

      if (
        credentials.email === 'admin@test.com' &&
        credentials.password === '123456'
      ) {
        this.router.navigate(['/dashboard']);
      } else {
        this.loginError = 'Nieprawidłowy email lub hasło.';
      }
    }, 1000);
  }
}
