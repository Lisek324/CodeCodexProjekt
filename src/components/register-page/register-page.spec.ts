import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ɵNoopNgZone } from '@angular/core';
import { RegisterPage } from './register-page';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('RegisterPage', () => {
  let fixture: ComponentFixture<RegisterPage>;
  let component: RegisterPage;

  const routerMock = {
    navigate: vi.fn(),
  };

  const authServiceMock = {
    register: vi.fn(),
    setToken: vi.fn(),
    loginWithGoogle: vi.fn(),
  };

  beforeEach(async () => {
    vi.restoreAllMocks();

    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ɵNoopNgZone, useClass: ɵNoopNgZone },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
  });

    function getHtml(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }
  function setValidForm() {
    component.form.setValue({
      fullName: 'Jan Kowalski',
      email: 'jan@test.pl',
      password: 'haslo12',
      confirmPassword: 'haslo12',
    });
  }
afterEach(() => {
  vi.clearAllMocks();
});
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form on init', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should validate password mismatch', () => {
    component.form.setValue({
      fullName: 'Jan Kowalski',
      email: 'jan@test.pl',
      password: 'haslo12',
      confirmPassword: 'inne12',
    });

    const confirmPassword = component.form.get('confirmPassword');

    expect(confirmPassword?.errors?.['passwordMismatch']).toBe(true);
    expect(component.form.invalid).toBe(true);
  });

  it('should validate matching passwords', () => {
    setValidForm();

    const confirmPassword = component.form.get('confirmPassword');

    expect(confirmPassword?.errors?.['passwordMismatch']).toBeUndefined();
    expect(component.form.valid).toBe(true);
  });

  it('should return false from hasDisplayableError when control is untouched and form not submitted', () => {
    const result = component.hasDisplayableError('email', 'required');

    expect(result).toBe(false);
  });

  it('should return true from hasDisplayableError when control is invalid and form submitted', () => {
    component.isSubmitted = true;

    const result = component.hasDisplayableError('email', 'required');

    expect(result).toBe(true);
  });

  it('should not call register when form is invalid', () => {
    component.onSubmit();

    expect(component.isSubmitted).toBe(true);
    expect(authServiceMock.register).not.toHaveBeenCalled();
    expect(component.isSubmitting()).toBe(false);
  });

it(']', async () => {
  setValidForm();

  authServiceMock.register.mockReturnValue(
    of({
      success: true,
      accessToken: 'token-123',
    })
  );

  component.onSubmit();
  fixture.detectChanges();
  await fixture.whenStable();

  expect(authServiceMock.register).toHaveBeenCalledWith({
    fullName: 'Jan Kowalski',
    email: 'jan@test.pl',
    password: 'haslo12',
    confirmPassword: 'haslo12',
  });
  expect(authServiceMock.setToken).toHaveBeenCalledWith('token-123');
  expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  expect(component.isSubmitted).toBe(false);
  expect(component.isSubmitting()).toBe(false);
});

  it('should not navigate when register response has success false', () => {
    setValidForm();

    authServiceMock.register.mockReturnValue(
      of({
        success: false,
        message: 'Registration failed',
      })
    );

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    component.onSubmit();

    expect(authServiceMock.register).toHaveBeenCalled();
    expect(authServiceMock.setToken).not.toHaveBeenCalled();
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Registration failed');
  });

  it('should handle register error and stop submitting state', () => {
    setValidForm();

    authServiceMock.register.mockReturnValue(
      throwError(() => ({
        error: { message: 'Server error' },
      }))
    );

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    component.onSubmit();

    expect(authServiceMock.register).toHaveBeenCalled();
    expect(component.isSubmitting()).toBe(false);
    expect(routerMock.navigate).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should call loginWithGoogle, setToken and navigate in handleCredentialResponse', () => {
    authServiceMock.loginWithGoogle.mockReturnValue(
      of({
        accessToken: 'google-token',
      })
    );

    component.handleCredentialResponse({
      credential: 'google-credential',
      select_by: 'btn',
      clientId: 'client-id',
    } as any);

    expect(authServiceMock.loginWithGoogle).toHaveBeenCalledWith('google-credential');
    expect(authServiceMock.setToken).toHaveBeenCalledWith('google-token');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should initialize google button in ngAfterViewInit when google api exists', () => {
    const initialize = vi.fn();
    const renderButton = vi.fn();

    (window as any).google = {
      accounts: {
        id: {
          initialize,
          renderButton,
        },
      },
    };

    component.buttonDiv = {
      nativeElement: document.createElement('div'),
    } as any;

    component.ngAfterViewInit();

    expect(typeof (window as any).onGoogleLibraryLoad).toBe('function');

    (window as any).onGoogleLibraryLoad();

    expect(initialize).toHaveBeenCalled();
    expect(renderButton).toHaveBeenCalledWith(
      component.buttonDiv.nativeElement,
      expect.objectContaining({
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signup_with',
        width: 320,
      })
    );
  });

  it('should not fail in ngAfterViewInit when google api does not exist', () => {
    (window as any).google = undefined;
    component.buttonDiv = {
      nativeElement: document.createElement('div'),
    } as any;

    expect(() => component.ngAfterViewInit()).not.toThrow();
    expect(typeof (window as any).onGoogleLibraryLoad).toBe('function');
  });
  it('should render all form inputs', () => {
    const html = getHtml();

    expect(html.querySelector('#fullName')).toBeTruthy();
    expect(html.querySelector('#email')).toBeTruthy();
    expect(html.querySelector('#password')).toBeTruthy();
    expect(html.querySelector('#confirmPassword')).toBeTruthy();
  });



  it('should show required error for fullName after invalid submit', () => {
    component.onSubmit();
    fixture.detectChanges();

    const html = getHtml();

    expect(html.textContent).toContain('Nazwa użytkownika jest wymagana');
  });

  it('should show required error for email after invalid submit', () => {
    component.onSubmit();
    fixture.detectChanges();

    const html = getHtml();

    expect(html.textContent).toContain('Adres email jest wymagany');
  });

  it('should show invalid email error for bad email format', () => {
    component.form.patchValue({
      fullName: 'Jan',
      email: 'zly-email',
    });

    component.form.get('email')?.markAsTouched();
    fixture.detectChanges();

    const html = getHtml();

    expect(html.textContent).toContain('Podaj poprawny adres email');
  });

  it('should show minlength error for password', () => {
    component.form.patchValue({
      fullName: 'Jan',
      email: 'jan@test.pl',
      password: 'a1',
      confirmPassword: 'a1',
    });

    component.form.get('password')?.markAsTouched();
    fixture.detectChanges();

    const html = getHtml();

    expect(html.textContent).toContain('Hasło musi mieć co najmniej 6 znaków');
  });

  it('should show password pattern error', () => {
    component.form.patchValue({
      fullName: 'Jan',
      email: 'jan@test.pl',
      password: 'abcdef',
      confirmPassword: 'abcdef',
    });

    component.form.get('password')?.markAsTouched();
    fixture.detectChanges();

    const html = getHtml();

    expect(html.textContent).toContain('Hasło musi zawierać co najmniej jedną literę i jedną cyfrę');
  });

  it('should show password mismatch error', () => {
    component.form.patchValue({
      fullName: 'Jan',
      email: 'jan@test.pl',
      password: 'haslo12',
      confirmPassword: 'inne12',
    });

    component.form.get('confirmPassword')?.markAsTouched();
    component.form.updateValueAndValidity();
    fixture.detectChanges();

    const html = getHtml();

    expect(html.textContent).toContain('Hasła są różne');
  });
});
