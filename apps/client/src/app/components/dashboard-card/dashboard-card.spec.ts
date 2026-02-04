import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCard } from './dashboard-card';
import { inputBinding, signal } from '@angular/core';

describe('DashboardCard', () => {
  let component: DashboardCard;
  let fixture: ComponentFixture<DashboardCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardCard]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardCard, {
      bindings: [
        inputBinding('label', signal('Chiffre d\'affaires')),
        inputBinding('iconPath', signal('assets/icons/euro.svg')),
        inputBinding('stat', signal({ currentValue: 1013.7700000000002, previousValue: 20, percentageChange: 10, trend: 'UP' })),
        inputBinding('key', signal('totalRevenue')),
        inputBinding('filterRangeDays', signal(10))
      ]
    });

    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should return a string if nothing match key value', () => {
    const displayValue = component['displayValue']();
    expect(displayValue).toBeTypeOf('string');
  });

  describe('DashboardCard Revenue', () => {
    it('should return revenue if key\'s matching', () => {
      const displayValue = component['displayValue']();
      const expectedValue = (1013.77).toLocaleString('fr-FR');

      expect(displayValue).toBeTypeOf('string');
      expect(displayValue).toStrictEqual(expectedValue);
    });
  })

  describe('DashboardCard Average Score', async () => {
    let newComponent: DashboardCard;
    let newFixture: ComponentFixture<DashboardCard>;

    beforeEach(async () => {
      newFixture = TestBed.createComponent(DashboardCard, {
        bindings: [
          inputBinding('label', signal('Note moyenne')),
          inputBinding('iconPath', signal('assets/icons/star.svg')),
          inputBinding('stat', signal({ currentValue: 4.5, previousValue: 4, percentageChange: 10, trend: 'UP' })),
          inputBinding('key', signal('averageScore')),
          inputBinding('filterRangeDays', signal(10))
        ]
      });

      newComponent = newFixture.componentInstance;
      await newFixture.whenStable();
    });

    it('should return averageScore if key\'s matching', () => {
      const displayValue = newComponent['displayValue']();

      expect(displayValue).toBeTypeOf('string');
      expect(displayValue).toStrictEqual('4.5/5');
    });
  })

});
