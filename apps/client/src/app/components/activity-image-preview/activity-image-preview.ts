import { Component, input, model, ViewEncapsulation } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { GalleriaModule } from 'primeng/galleria';
@Component({
  selector: 'app-activity-image-preview',
  imports: [DialogModule, ButtonModule, GalleriaModule],
  templateUrl: './activity-image-preview.html',
  styleUrl: './activity-image-preview.css',
  encapsulation: ViewEncapsulation.None,
})
export class ActivityImagePreview {
  visible = model<boolean>(false);

  imagesUrl = input.required<string[]>();

  protected onClose(): void {
    this.visible.set(false);
  }
}
