import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { NEVER, of } from 'rxjs';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  const authServiceMock = {
    currentUser: vi.fn(),
    getCourses: vi.fn(),
  };
  const routerMock = {
    navigate: vi.fn(),
  };

  beforeEach(async () => {
    authServiceMock.currentUser.mockReturnValue('Jan Kowalski');
    authServiceMock.getCourses.mockReturnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: Location, useValue: vi.fn() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('should render user name in heading', () => {
    authServiceMock.currentUser.mockReturnValue('Jan Kowalski');
    component.isLoading.set(false);
    component.courses.set([]);

    fixture.detectChanges();

    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent.trim()).toContain('Witaj, Jan Kowalski');
  });

  it('should render fallback user name when currentUser is null', () => {
    authServiceMock.currentUser.mockReturnValue(null);
    component.isLoading.set(false);
    component.courses.set([]);

    fixture.detectChanges();

    const h1 = fixture.nativeElement.querySelector('h1');
    expect(h1.textContent.trim()).toContain('Witaj, Użytkowniku');
  });

  it('should render loading state when isLoading is true', () => {
    authServiceMock.getCourses.mockReturnValue(NEVER);

    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('.spinner-border');
    const loadingText = fixture.nativeElement.textContent;

    expect(spinner).toBeTruthy();
    expect(loadingText).toContain('Ładowanie Twoich kursów...');
  });

  it('should render empty state when there are no courses', () => {
    component.isLoading.set(false);
    component.courses.set([]);

    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('.alert-info');
    expect(alert).toBeTruthy();
    expect(alert.textContent).toContain('Nie masz jeszcze żadnych kursów.');

    const link = fixture.debugElement.query(By.css('a[routerLink="/home"]'));
    expect(link).toBeTruthy();
  });

  it('should render courses count and course cards', () => {
    authServiceMock.getCourses.mockReturnValue(
      of([
        { id: 1, name: 'Angular od podstaw' },
        { id: 2, name: 'ASP.NET Core API' },
      ])
    );

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    const cards = fixture.nativeElement.querySelectorAll('.card');
    const buttons = fixture.nativeElement.querySelectorAll('button');

    expect(text).toContain('2 kursy');
    expect(text).toContain('Angular od podstaw');
    expect(text).toContain('ASP.NET Core API');
    expect(cards.length).toBe(2);
    expect(buttons.length).toBe(2);
  });
  it('should call redirectToCourse with correct id for clicked course', () => {
    authServiceMock.getCourses.mockReturnValue(
      of([
        { id: 1, name: 'Angular od podstaw' },
        { id: 2, name: 'ASP.NET Core API' },
      ])
    );

    const spy = vi.spyOn(component, 'redirectToCourse');

    fixture.detectChanges();

    const buttons = fixture.debugElement.queryAll(By.css('button.btn-outline-primary'));
    expect(buttons.length).toBe(2);

    buttons[1].nativeElement.click();

    expect(spy).toHaveBeenCalledWith(2);
  });
});
