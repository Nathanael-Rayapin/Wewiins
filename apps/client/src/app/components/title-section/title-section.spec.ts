import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitleSection } from './title-section';

describe('TitleSection', () => {
  let component: TitleSection;
  let fixture: ComponentFixture<TitleSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitleSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TitleSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
