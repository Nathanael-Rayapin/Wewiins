import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityImageProgram } from './activity-image-program';

describe('ActivityImageProgram', () => {
  let component: ActivityImageProgram;
  let fixture: ComponentFixture<ActivityImageProgram>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityImageProgram]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActivityImageProgram);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
