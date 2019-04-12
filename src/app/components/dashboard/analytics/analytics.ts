import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { DashboardHeaderComponent } from '../main/header/header.component';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-analytics',
    templateUrl: 'analytics.html',
})

export class AnalyticsComponent implements AfterViewChecked {
  constructor(private cdRef: ChangeDetectorRef) {
  }

  ngAfterViewChecked() {
    const t = DashboardHeaderComponent.t;
    t.writePageName('Analytics');
    this.cdRef.detectChanges();
  }
}
