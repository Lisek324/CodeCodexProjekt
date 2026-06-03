import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { By } from '@angular/platform-browser';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let component: App;

  let serviceMock: ReturnType<typeof createAuthServiceMock>;

  function createAuthServiceMock() {
    return {
      isLoggedIn: vi.fn(),
      avatarUrl: vi.fn(),
      logout: vi.fn(),
    };
  }

  beforeEach(async () => {
    serviceMock = createAuthServiceMock();

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '**', redirectTo: '', pathMatch: 'full' },
        ]),
        { provide: AuthService, useValue: serviceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    serviceMock.isLoggedIn.mockClear();
    serviceMock.avatarUrl.mockClear();
    serviceMock.logout.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    serviceMock.isLoggedIn.mockReturnValue(false);
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should render app brand name', () => {
    serviceMock.isLoggedIn.mockReturnValue(false);
    fixture.detectChanges();

    const brandLink: HTMLAnchorElement = fixture.nativeElement.querySelector(
      'a[routerLink="/home"]'
    );

    expect(brandLink).toBeTruthy();
    expect(brandLink.textContent?.trim()).toBe('CodeCodex');
  });

  it('should render footer with current copyright text', () => {
    serviceMock.isLoggedIn.mockReturnValue(false);
    fixture.detectChanges();

    const footerText = fixture.nativeElement.querySelector('footer p');

    expect(footerText).toBeTruthy();
    expect(footerText.textContent?.trim()).toContain('© 2026 CodeCodex');
  });

  it('should show register and login links when user is not logged in', () => {
    serviceMock.isLoggedIn.mockReturnValue(false);
    fixture.detectChanges();

    const registerLink: HTMLAnchorElement = fixture.nativeElement.querySelector(
      'a[routerLink="/register"]'
    );
    const loginLink: HTMLAnchorElement = fixture.nativeElement.querySelector(
      'a[routerLink="/login"]'
    );
    const accountLink: HTMLAnchorElement = fixture.nativeElement.querySelector(
      '.account-link'
    );

    expect(registerLink).toBeTruthy();
    expect(registerLink.textContent?.trim()).toBe('Zarejestruj');

    expect(loginLink).toBeTruthy();
    expect(loginLink.textContent?.trim()).toBe('Zaloguj');

    expect(accountLink).toBeNull();
  });

  it('should show account dropdown when user is logged in', () => {
    serviceMock.isLoggedIn.mockReturnValue(true);
    serviceMock.avatarUrl.mockReturnValue('https://example.com/avatar.png');
    fixture.detectChanges();

    const accountLink: HTMLAnchorElement = fixture.nativeElement.querySelector(
      '.account-link'
    );
    const dashboardLink: HTMLAnchorElement = fixture.nativeElement.querySelector(
      '.dropdown-item[routerLink="/dashboard"]'
    );
    const logoutLinks: HTMLAnchorElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.dropdown-item')
    );

    expect(accountLink).toBeTruthy();
    expect(accountLink.textContent?.trim()).toBe('Moje konto');

    expect(dashboardLink).toBeTruthy();
    expect(
      logoutLinks.some(link => link.textContent?.trim() === 'Wyloguj')
    ).toBe(true);
  });

  it('should render avatar from service when user is logged in and avatar exists', () => {
    serviceMock.isLoggedIn.mockReturnValue(true);
    serviceMock.avatarUrl.mockReturnValue('https://example.com/avatar.png');
    fixture.detectChanges();

    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');

    expect(img).toBeTruthy();
    expect(img.src).toBe('https://example.com/avatar.png');
    expect(img.alt).toBe('Avatar użytkownika');
  });

  it('should render default gravatar when user is logged in and avatar is null', () => {
    serviceMock.isLoggedIn.mockReturnValue(true);
    serviceMock.avatarUrl.mockReturnValue(null);
    fixture.detectChanges();

    const img: HTMLImageElement = fixture.nativeElement.querySelector('img');

    expect(img).toBeTruthy();
    expect(img.src).toContain('https://www.gravatar.com/avatar/?d=mp');
  });

  it('should call logout after clicking logout link', () => {
    serviceMock.isLoggedIn.mockReturnValue(true);
    serviceMock.avatarUrl.mockReturnValue(null);
    fixture.detectChanges();

    const logoutDebugEl = fixture.debugElement
      .queryAll(By.css('.dropdown-item'))
      .find(de => de.nativeElement.textContent.trim() === 'Wyloguj');

    expect(logoutDebugEl).toBeTruthy();

    logoutDebugEl!.triggerEventHandler('click', new MouseEvent('click'));
    expect(serviceMock.logout).toHaveBeenCalled();
  });

  it('should contain router outlet', () => {
    serviceMock.isLoggedIn.mockReturnValue(false);
    fixture.detectChanges();

    const routerOutlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(routerOutlet).toBeTruthy();
  });
});