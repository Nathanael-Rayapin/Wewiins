import { Component, input, output, ViewEncapsulation } from '@angular/core';
import { IconSvg } from '../icon-svg/icon-svg';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-good-to-know-card',
  imports: [IconSvg, CheckboxModule, FormsModule],
  templateUrl: './good-to-know-card.html',
  styleUrl: './good-to-know-card.css',
  encapsulation: ViewEncapsulation.None,
})
export class GoodToKnowCard {
  checkedChange = output<boolean>();

  name = input.required<string>();
  iconName = input.required<string>();
  description = input.required<string>();

  checked: boolean = false;

  onCheckboxChange(event: CheckboxChangeEvent) {    
    this.checkedChange.emit(event.checked); 
  }
}
