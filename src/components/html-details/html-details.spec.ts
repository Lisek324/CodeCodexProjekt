import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlDetails } from './html-details';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('HtmlDetails', () => {
  let component: HtmlDetails;
  let fixture: ComponentFixture<HtmlDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HtmlDetails],
      providers: [
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
