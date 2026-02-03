import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Datepicker } from './datepicker';
import { inputBinding, signal } from '@angular/core';

vi.mock(import('./datepicker'), { spy: true })

describe('Datepicker', () => {
  let component: Datepicker;
  let fixture: ComponentFixture<Datepicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Datepicker]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Datepicker, {
      bindings: [
        inputBinding('startDate', signal(new Date('2025-01-01')))
      ]
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should update statsDateRange when onDateSelect is triggered', () => {
    component['onDateSelect'](new Date('01-02-26'));

    expect(component.statsDateRange).toStrictEqual([new Date('01-02-26'), component.today]);
  });

  it('should update startDate when onDateSelect is triggered', () => {
    component['onDateSelect'](new Date('01-02-26'));

    expect(component.startDate()).toEqual(new Date('01-02-26'));
  });

  it('should startDateChange emit when onDateSelect is triggered', () => {
    const selectedDate = new Date('2026-02-01');
    component['onDateSelect'](selectedDate);

    const spy = vi.spyOn(component.startDateChange, 'emit');

    component['onDateSelect'](selectedDate);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(selectedDate);
  });
});
