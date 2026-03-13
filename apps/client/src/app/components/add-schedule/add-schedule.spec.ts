import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddActivityDialog } from './add-schedule';
import { inputBinding, outputBinding, signal } from '@angular/core';

describe('AddActivityDialog', () => {
    let component: AddActivityDialog;
    let fixture: ComponentFixture<AddActivityDialog>;
    let addScheduleSpy = vi.fn();
    let cancelSpy = vi.fn();

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AddActivityDialog],
        }).compileComponents();

        fixture = TestBed.createComponent(AddActivityDialog, {
            bindings: [
                inputBinding('visible', signal(false)),
                inputBinding('editingScheduleId', signal(null)),

                inputBinding('initialAvailabilityFrom', signal(undefined)),
                inputBinding('initialAvailabilityTo', signal(undefined)),
                inputBinding('initialUnavailabilityFrom', signal(undefined)),
                inputBinding('initialUnavailabilityTo', signal(undefined)),
                inputBinding('initialSelectedDays', signal(undefined)),

                outputBinding('scheduleAdded', addScheduleSpy),
                outputBinding('cancelled', cancelSpy),
            ]
        });
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    afterEach(() => {
        addScheduleSpy.mockClear();
        cancelSpy.mockClear();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    describe('dayOfWeek', () => {
        it('should add a day if not present', () => {
            component.dayOfWeek.set([]);

            component['addToSelectedDays']('Lundi');

            expect(component.dayOfWeek()).toEqual(['Lundi']);
        });

        it('should remove a day if already selected', () => {
            component['addToSelectedDays']('Lundi');

            component['addToSelectedDays']('Lundi');

            expect(component.dayOfWeek()).toEqual([]);
        });
    })

    describe('canAddSchedule', () => {
        it('should return false if required fields missing', () => {
            component.openTime.set(undefined);
            component.closeTime.set(undefined);
            component.dayOfWeek.set([]);

            expect(component['canAddSchedule']()).toBeFalsy();
        });

        it('should return true when schedule is valid', () => {
            component.openTime.set(new Date());
            component.closeTime.set(new Date());
            component.dayOfWeek.set(['Lundi']);

            component.availabilityToError.set(null);
            component.unavailabilityFromError.set(null);
            component.unavailabilityToError.set(null);

            expect(component['canAddSchedule']()).toBeTruthy();
        });
    })

    it('should emit schedule when adding valid schedule', () => {
        const open = new Date();
        const close = new Date();

        component.openTime.set(open);
        component.closeTime.set(close);
        component.dayOfWeek.set(['Lundi']);

        component['onAddSchedule']();

        expect(addScheduleSpy).toHaveBeenCalled();
    });

    it('should not emit schedule when form invalid', () => {
        component['onAddSchedule']();

        expect(addScheduleSpy).not.toHaveBeenCalled();
    });

    it('should close dialog and emit cancel', () => {
        component.visible.set(true);

        component['onCancel']();

        expect(component.visible()).toBeFalsy();
        expect(cancelSpy).toHaveBeenCalled();
    });

    it('should set error if break starts before opening', () => {
        const open = new Date(2024, 0, 1, 9, 0);
        const close = new Date(2024, 0, 1, 18, 0);
        const breakStart = new Date(2024, 0, 1, 8, 0);
        const breakEnd = new Date(2024, 0, 1, 9, 30);

        component.openTime.set(open);
        component.closeTime.set(close);
        component.breakStart.set(breakStart);
        component.breakEnd.set(breakEnd);

        component['validateUnavailability']();

        expect(component.unavailabilityFromError()).not.toBeNull();
    });
});
