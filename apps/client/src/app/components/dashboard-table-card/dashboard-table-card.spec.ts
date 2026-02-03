import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardTableCard } from './dashboard-table-card';
import { inputBinding, signal } from '@angular/core';

describe('DashboardTableCard', () => {
  let component: DashboardTableCard;
  let fixture: ComponentFixture<DashboardTableCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardTableCard]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardTableCard, {
      bindings: [
        inputBinding(
          'bookings', signal([
            {
              id: "1",
              reference: "123",
              name: "John Doe",
              date: "2026-01-01",
              startTime: null,
              endTime: null,
              participants: 4,
              title: "Karting",
              totalPrice: 29.99,
              status: "FINISH"
            },
            {
              id: "2",
              reference: "456",
              name: "Jane Doe",
              date: "2025-01-01",
              startTime: null,
              endTime: null,
              participants: 2,
              title: "Skateboarding",
              totalPrice: 19.99,
              status: "COMING_SOON"
            },
            {
              id: "3",
              reference: "789",
              name: "Joline Doe",
              date: "2023-01-01",
              startTime: null,
              endTime: null,
              participants: 1,
              title: "Aquaplanning",
              totalPrice: 39.99,
              status: "COMING_SOON"
            },
          ])
        )
      ]
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should sort bookings by date', () => {
    const bookings = component['bookingsComputed']();

    expect(bookings[0].date).toBe('2025-01-01');
    expect(bookings[1].date).toBe('2026-01-01');
  });
});
