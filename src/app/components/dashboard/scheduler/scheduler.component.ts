import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewChecked, Inject, forwardRef } from '@angular/core';
import {Params, ActivatedRoute} from '@angular/router';
import { TestScenarioComponent } from './test-scenario.component';
import { ModalService } from '../../../services/modal.service';
import { filter } from 'rxjs/operators';
import { Observable } from '../../../../../node_modules/rxjs';
import { ApiService } from 'app/services/api.service';
import { DashboardHeaderComponent } from '../main/header/header.component';
import { GeneralGridComponent } from 'app/components/uc/ants-grid/generalGrid.component';

export let daysAgo = 0;

@Component({
    templateUrl: 'scheduler.html'
})
export class SchedulerComponent implements OnInit, AfterViewChecked {
  static t: SchedulerComponent;

  @ViewChild(TestScenarioComponent) tsList: TestScenarioComponent;
   td = null;
   ts = '';
   tsDays = null;
   titleReport = '';
   maskName = 'Ts_By_day';
   TcRunId;
   AutoLoginKey;
   lastSelected;
   loadingDays = false;

  constructor(private activatedRoute: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private apiService: ApiService,
    private modalService: ModalService,
    @Inject(forwardRef(() => GeneralGridComponent)) private gridGeneral2: GeneralGridComponent
    ) {
    // this.modalService.modalShowChanges.filter(modale => modale.modal === 'tsEditor' && modale.action === 'close')
    //   .subscribe(() => this.tsList.ngOnInit());
    this.modalService.modalShowChanges.pipe(
        filter(modale => modale.modal === 'tsEditor' && modale.action === 'close')
    ).subscribe(() => this.tsList.ngOnInit());
  }

  ngAfterViewChecked() {
    const t = DashboardHeaderComponent.t;
    t.writePageName('Monitoring Tests');
    this.cdRef.detectChanges();
  }

  ngOnInit () {
    SchedulerComponent.t = this;
    this.loadingDays = false;
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      // console.log('PARAMS', params);
      if (params['filter'] && params['filter'] !== undefined) {
        if (params['filter'] === 'autoLogin') {
          this.TcRunId = params['tcrunid'];
          this.AutoLoginKey = params['key'];

          this.modalService.modalShow({'modal': 'tcDetail', 'action': 'open', 'tcRunId': '***' +
            this.TcRunId + ';' + this.AutoLoginKey});
          } else {
          this.td = params['filter'];
          this.ts = null;
          this.tsDays = null;
        }
      } else {
        // params['filter'] = '***';
      }
    });
  }

  onTestScenarioSelected(message) {
    this.ts = null;
    this.tsDays = null;

    if (message) {
      this.gridGeneral2.reloadGrid(this.maskName, message.TS_ID);
    }
  }

  showWaitIcon() {
    this.tsDays = null;
    this.loadingDays = true;
  }

  fillGrid(d, t) {
    const subscribe = Observable.timer(0, 1500)
      .take(1)
      .subscribe(() => {
        this.titleReport = t;
        this.loadingDays = false;
        this.tsDays = d;

        const ll = DashboardHeaderComponent.t;
        const ev = ll.getLastEvent();
        if (ev && d.DataTable[0].ANTS_ID !== undefined) {
          ev.ANTS_ID = d.DataTable[0].ANTS_ID;
          this.selectionChangedByDay(ev);
        }
    });
  }

  calculateDate(date1, date2){
    const diffc = date1.getTime() - date2.getTime();
    const days = Math.round(Math.abs(diffc / (1000 * 60 * 60 * 24)));

    return days;
  }

  selectionChangedByDay(event) {
    const ll = DashboardHeaderComponent.t;
    ll.setLastEvent(event);

    const daysAgo2 = this.calculateDate(new Date(event.DAY), new Date());
    daysAgo = daysAgo2;

    this.ts = event;
  }

  updateTsList() {
    this.tsList.ngOnInit();
  }

}
