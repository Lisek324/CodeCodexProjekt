import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CppDetails } from './cpp-details';

describe('CppDetails', () => {
  let component: CppDetails;
  let fixture: ComponentFixture<CppDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CppDetails]
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
