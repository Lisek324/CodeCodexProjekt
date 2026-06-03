import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CppDetails } from './cpp-details';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

describe('CppDetails', () => {
  let component: CppDetails;
  let fixture: ComponentFixture<CppDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CppDetails],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(CppDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
