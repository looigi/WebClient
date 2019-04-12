import { HostListener, Component, ViewChild, OnInit } from '@angular/core';
import {trigger, state, style, animate, transition} from '@angular/animations';
import {ModalService} from '../../../../services/modal.service';
import {ApiService} from '../../../../services/api.service';
import {TestScenario} from '../../../../models/test-scenario/test-scenario.model';
import { SchedulerComponent } from '../../scheduler/scheduler.component';
import { AntsGridComponent } from '../../../uc/ants-grid/ants-grid.component';
import { Router } from '@angular/router';
import { SessionService } from '../../../../services/session.service';
import { DashboardHeaderComponent } from '../header/header.component';
import { Location } from '@angular/common';

@Component({
    selector: 'dashboard-component',
    templateUrl: 'dashboard.html',
    animations: [
    trigger('modalExpandeTrigger', [
      state('closed', style({ opacity: '0' })),
      state('open', style({ opacity: '1' })),
      transition('closed => open', animate('1000ms ease-in')),
      transition('open => closed', animate('1000ms ease-out')),
    ]),
  ]
})

export class DashboardComponent {
  static t: AntsGridComponent;

  @ViewChild(SchedulerComponent) scheduler: SchedulerComponent;

  public testScenarioToEdit: TestScenario = null;
  loadingTS = null;
  // private tsEditorState = 'closed';

  mainViewShow = true;
  mainViewState = 'open';
  tsEditorShow = false;
  tsEditorState = 'closed';
  tcDetailShow = false;
  tcDetailState = 'close';
  tsDetailShow = false;
  tsDetailState = 'close';

  public tcRunId = null;
  public ts = null;

  /* @HostListener('window:beforeunload') function (event) {
    this.apiService.logout()
    .map(response => response.json())
    .subscribe(
        data => {
        },
        error => {
    });
    event.preventDefault();
  }

  @HostListener('window:beforeunload', ['$event']) unloadHandler(event: Event) {
    this.sessionService.logout();
    this.router.navigateByUrl('/login');

    // Do more processing...
    event.returnValue = true;
  }

  @HostListener('window:unload', ['$event'])
  unloadHandler(event) {
    console.log('unloadHandler');
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHander(event) {
    this.sessionService.logout();
    this.router.navigateByUrl('/login');

    return true;
  }*/

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private apiService: ApiService,
    private location: Location,
    private tsEditorModalService: ModalService
  ) {
    tsEditorModalService.modalShowChanges.subscribe(tsEditorData => {
      console.log('emit service', tsEditorData);
      this.handleModal(tsEditorData);
    });
  }

  getHeight() {
    if (this.tsEditorShow || this.tcDetailShow || this.tsDetailShow) {
      return '0';
    } else {
      return '100';
    }
  }

  protected pageChange(): void {
  }

  private handleModal(data) {
    if (data.modal === 'tsEditor') {
      if (this.loadingTS === null || (Date.now() - this.loadingTS > 5000)) {
        // console.log('Entrato: ' + this.loadingTS);
        this.loadingTS = Date.now();
        let params;
        switch (data.action) {
          case 'open':
            if (data.tsId) {
              params = {tdName: data.tdName, tsId: data.tsId};
            } else {
              params = {tdName: data.tdName};
            }
            this.apiService.getTestScenarioObject(params)
              .map(response => response.json())
              .subscribe(result => {
                this.switchView('tsEditor');
                const res = result.OBJECT[0].object;
                // console.log('---------------');
                // console.log(res);
                // console.log('---------------');

                res.TimeSchedule.StartDate = res.TimeSchedule.StartDate === '' ||
                !res.TimeSchedule.StartDate ? null : new Date(res.TimeSchedule.StartDate);
                console.log('DateStart', res.TimeSchedule.StartDate);
                this.testScenarioToEdit = <TestScenario> res;
                console.log('Test Scenario Object', this.testScenarioToEdit, 'oggetto originale', res);
              });
            break;
          case 'copy':
            if (data.data.dataItem.TS_ID) {
              params = {tdName: data.data.dataItem.TD_NAME, tsId: data.data.dataItem.TS_ID};
            } else {
              params = {tdName: data.data.dataItem.TD_NAME};
            }
            this.apiService.getTestScenarioObject(params)
              .map(response => response.json())
              .subscribe(result => {
                this.switchView('tsEditor');
                const res = result.OBJECT[0].object;
                // console.log('---------------');
                // console.log(res);
                // console.log('---------------');
                res.TsId = 'COPY';
                const ts: TestScenario = <TestScenario> res;

                res.StartDate = res.StartDate === '' ||
                !res.StartDate ? null : new Date(res.StartDate);
                console.log('DateStart', res.StartDate);
                this.testScenarioToEdit = ts;
                console.log('Test Scenario Object', this.testScenarioToEdit, 'oggetto originale', res);
              });
            break;
          case 'close':
            this.switchView('mainView');
            this.tsEditorShow = false;
            this.testScenarioToEdit = null;
            this.loadingTS = false;
          }
      }
    }
    if (data.modal === 'tcDetail') {
      switch (data.action) {
        case 'open':
          this.tcRunId = data.tcRunId;
          this.switchView('tcDetail');
          break;
        case 'close':
          this.switchView('mainView');
          this.tcDetailShow = false;
          this.tcRunId = null;
          break;
      }
    }
    if (data.modal === 'tsDetail') {
      switch (data.action) {
        case 'open':
          this.ts = data.ts;
          this.switchView('tsDetail');
          break;
        case 'close':
          this.switchView('mainView');
          this.tsDetailShow = false;
          this.ts = null;
          break;
      }
    }
  }

  switchView(view) {
    switch (view) {
      case 'mainView':
        this.mainViewShow = true;
        this.mainViewState = 'open';
        this.tsEditorShow = false;
        this.tsEditorState = 'closed';
        this.tcDetailShow = false;
        this.tcDetailState = 'closed';
        break;
      case 'tsEditor':
        this.mainViewShow = false;
        this.mainViewState = 'closed';
        this.tsEditorShow = true;
        this.tsEditorState = 'open';
        this.tcDetailShow = false;
        this.tcDetailState = 'closed';
        break;
      case 'tcDetail':
        this.mainViewShow = false;
        this.mainViewState = 'closed';
        this.tsEditorShow = false;
        this.tsEditorState = 'closed';
        this.tcDetailShow = true;
        this.tcDetailState = 'open';
        break;
      case 'tsDetail':
        this.mainViewShow = false;
        this.mainViewState = 'closed';
        this.tsEditorShow = false;
        this.tsEditorState = 'closed';
        this.tsDetailShow = true;
        this.tsDetailState = 'open';
        break;
    }
  }

  private updateTsList() {
    this.scheduler.updateTsList();
  }
}
