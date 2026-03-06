import { Component, input, model, ViewEncapsulation } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { GalleriaModule } from 'primeng/galleria';

@Component({
  selector: 'app-activity-image-program',
  imports: [DialogModule, ButtonModule, GalleriaModule],
  templateUrl: './activity-image-program.html',
  styleUrl: './activity-image-program.css',
   encapsulation: ViewEncapsulation.None,
})
export class ActivityImageProgram {
  visible = model<boolean>(false);

  imagesUrl = input.required<string[]>();

  protected onClose(): void {
    this.visible.set(false);
  }
}
