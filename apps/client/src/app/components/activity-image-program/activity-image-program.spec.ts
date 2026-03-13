import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityImageProgram } from './activity-image-program';
import { inputBinding, signal } from '@angular/core';

describe('ActivityImageProgram', () => {
  let component: ActivityImageProgram;
  let fixture: ComponentFixture<ActivityImageProgram>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityImageProgram]
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityImageProgram, {
      bindings: [
        inputBinding('visible', signal(false)),
        inputBinding('imagesUrl', signal([]))
      ]
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should be created create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog when onClose is called', () => {
    component.visible.set(true);

    component['onClose']();

    expect(component.visible()).toBe(false);
  });
});
