import { Component, inject, OnInit } from '@angular/core';
import { TitleSection } from '../../components/title-section/title-section';
import { OrchestrationService } from '../../services/orchestration.service';

@Component({
  selector: 'app-dashboard',
  imports: [TitleSection],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {

  private orchestrationService = inject(OrchestrationService);

  ngOnInit(): void {
    this.orchestrationService.initializeDashboard();
  }
}
