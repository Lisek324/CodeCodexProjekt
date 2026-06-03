import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AngularDetail } from './angular-detail';
import { provideHttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth-service';

describe('AngularDetail', () => {
  let fixture: ComponentFixture<AngularDetail>;
  let component: AngularDetail;
  let hasCourseSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngularDetail],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AngularDetail);
    component = fixture.componentInstance;

    hasCourseSubject = new BehaviorSubject<boolean>(false);
    component.hasAngularCourse$ = hasCourseSubject.asObservable();

    vi.spyOn(component, 'buyAngularCourse');
    vi.spyOn(component, 'redirectToCourse');
  });

  it('should show "Kup teraz" when user does not have the course', async () => {
    vi.spyOn(TestBed.inject(AuthService), 'isLoggedIn').mockReturnValue(true);
    hasCourseSubject.next(false);

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button.btn.btn-primary');

    expect(button.textContent?.trim()).toBe('Kup teraz');
    expect(button.disabled).toBe(false);
  });

  it('should call buyAngularCourse(2) after click', () => {
    const service = TestBed.inject(AuthService);
    vi.spyOn(service, 'isLoggedIn').mockReturnValue(true);

    const spy = vi.spyOn(component, 'buyAngularCourse');

    hasCourseSubject.next(false);
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button.btn.btn-primary');

    expect(button.textContent?.trim()).toBe('Kup teraz');

    button.click();

    expect(spy).toHaveBeenCalledWith(2);
  });

  it('should show "Przejdz do kursu" when user already has the course', () => {
    const service = TestBed.inject(AuthService);
    vi.spyOn(service, 'isLoggedIn').mockReturnValue(true);

    hasCourseSubject.next(true);
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button.btn.btn-primary');

    expect(button.textContent?.trim()).toBe('Przejdź do kursu');
    expect(button.disabled).toBe(false);
  });

  it('should call redirectToCourse(2) after click', () => {
    const service = TestBed.inject(AuthService);
    vi.spyOn(service, 'isLoggedIn').mockReturnValue(true);

    const spy = vi.spyOn(component, 'redirectToCourse');

    hasCourseSubject.next(true);
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button.btn.btn-primary');

    expect(button.textContent?.trim()).toBe('Przejdź do kursu');

    button.click();

    expect(spy).toHaveBeenCalledWith(2);
  });
  it('should show "Kup teraz" when user does not have the course', () => {
    const service = TestBed.inject(AuthService);
    vi.spyOn(service, 'isLoggedIn').mockReturnValue(true);

    hasCourseSubject.next(false);
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button.btn.btn-primary');

    expect(button.textContent?.trim()).toBe('Kup teraz');
    expect(button.disabled).toBe(false);
  });
  it('should show "Zaloguj się" for guest user', () => {
    const service = TestBed.inject(AuthService);
    vi.spyOn(service, 'isLoggedIn').mockReturnValue(false);

    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button.btn.btn-primary');

    expect(button.textContent?.trim()).toBe('Zaloguj się');
  });
});