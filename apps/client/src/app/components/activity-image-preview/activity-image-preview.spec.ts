import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityImagePreview } from './activity-image-preview';
import { inputBinding, signal } from '@angular/core';

describe('ActivityImagePreview', () => {
    let component: ActivityImagePreview;
    let fixture: ComponentFixture<ActivityImagePreview>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ActivityImagePreview]
        }).compileComponents();

        fixture = TestBed.createComponent(ActivityImagePreview, {
            bindings: [
                inputBinding('visible', signal(false)),
                inputBinding('imagesUrl', signal([]))
            ]
        });
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });

    it('should close the dialog when onClose is called', () => {
        component.visible.set(true);

        component['onClose']();

        expect(component.visible()).toBe(false);
    });
});
