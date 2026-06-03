import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlDetails } from './html-details';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('HtmlDetails', () => {
  let component: HtmlDetails;
  let fixture: ComponentFixture<HtmlDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HtmlDetails],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(HtmlDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
