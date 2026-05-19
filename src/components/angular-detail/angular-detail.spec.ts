import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularDetail } from './angular-detail';

describe('AngularDetail', () => {
  let component: AngularDetail;
  let fixture: ComponentFixture<AngularDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngularDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AngularDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
