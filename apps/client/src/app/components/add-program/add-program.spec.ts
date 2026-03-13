import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddProgram } from './add-program';
import { BreakpointObserver } from '@angular/cdk/layout';
import { of } from 'rxjs';
import { inputBinding, outputBinding, signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { vi } from 'vitest';

describe('AddProgram', () => {
  let component: AddProgram;
  let fixture: ComponentFixture<AddProgram>;

  const form = new FormGroup({
    title: new FormControl(''),
    description: new FormControl(''),
    image: new FormControl(null)
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddProgram],
      providers: [
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () => of({ matches: true })
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddProgram, {
      bindings: [
        inputBinding('programForm', signal(form)),
        inputBinding('index', signal(0)),
        outputBinding('remove', () => { }),
      ]
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct form controls', () => {
    expect(component.titleControl).toBe(form.get('title'));
    expect(component.descriptionControl).toBe(form.get('description'));
    expect(component.imageControl).toBe(form.get('image'));
  });

  it('should generate preview url when image exists', () => {
    const file = new File(['test'], 'image.png', { type: 'image/png' });

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');

    component.imageControl.setValue(file);

    expect(component.imagePreviewUrl).toBe('blob:test');
  });

  it('should show title error when control invalid and touched', () => {
    const control = component.titleControl;
    control.setErrors({ required: true });
    control.markAsTouched();

    expect(component.showTitleError).toBeTruthy();
  });

  it('should reset image when removeImage is called', () => {
    const file = new File(['test'], 'image.png');

    component.imageControl.setValue(file);

    component['removeImage']();

    expect(component.imageControl.value).toBeNull();
    expect(component.imageControl.dirty).toBeTruthy();
    expect(component.imageControl.touched).toBeTruthy();
  });

  it('should emit remove event when removeProgram is called', () => {
    vi.spyOn(component.remove, 'emit');

    component['removeProgram']();

    expect(component.remove.emit).toHaveBeenCalled();
  });
});
