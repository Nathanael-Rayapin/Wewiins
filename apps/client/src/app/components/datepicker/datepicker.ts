import { ChangeDetectionStrategy, Component, model, output, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-datepicker',
  imports: [FormsModule, DatePickerModule],
  templateUrl: './datepicker.html',
  styleUrl: './datepicker.css',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Datepicker {
  startDate = model.required<Date>();
  startDateChange = output<Date>();

  // Only for UI purposes
  statsDateRange: Date[] = [];

  today: Date = new Date();

  protected onDateSelect(selectedDate: Date) {
    this.statsDateRange = [selectedDate, this.today];
    this.startDate.set(selectedDate);
    this.startDateChange.emit(selectedDate);
  }
}
