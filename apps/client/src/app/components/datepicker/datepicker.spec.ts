import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Datepicker } from './datepicker';
import { inputBinding, signal } from '@angular/core';

vi.mock(import('./datepicker'), { spy: true })

describe('Datepicker', () => {
  let component: Datepicker;
  let fixture: ComponentFixture<Datepicker>;
  let selectedDate: Date;

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

    selectedDate = new Date('01-02-26');

    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should update statsDateRange when onDateSelect is triggered', () => {
    component['onDateSelect'](selectedDate);

    expect(component.statsDateRange).toHaveLength(2);
    expect(component.statsDateRange[0]).toEqual(selectedDate);
    expect(component.statsDateRange[1]).toBe(component.today);
  });

  it('should update startDate when onDateSelect is triggered', () => {
    component['onDateSelect'](selectedDate);

    expect(component.startDate().getTime()).toEqual(selectedDate.getTime());
  });

  it('should startDateChange emit when onDateSelect is triggered', () => {
    const spy = vi.spyOn(component.startDateChange, 'emit');

    component['onDateSelect'](selectedDate);
    component['onDateSelect'](selectedDate);

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(selectedDate);
  });
});
