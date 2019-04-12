import { Component, OnInit, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { DashboardHeaderComponent } from '../main/header/header.component';

@Component({
  templateUrl: 'topology.html'
})

export class TopologyComponent implements AfterViewChecked {
  constructor(private cdRef: ChangeDetectorRef) {
  }

  ngAfterViewChecked() {
    const t = DashboardHeaderComponent.t;
    t.writePageName('Site Coverage');
    this.cdRef.detectChanges();
  }
}
