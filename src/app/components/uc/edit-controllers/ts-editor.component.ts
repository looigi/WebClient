import {
  Component, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren, ViewChild
} from '@angular/core';
import {TestScenario} from '../../../models/test-scenario/test-scenario.model';
import {TsController} from '../../../models/test-scenario/ts-controller.model';
import {ModalService} from '../../../services/modal.service';
import {ApiService} from '../../../services/api.service';
import { EditMaskTabComponent } from './edit-mask.tab.component';
import { gridExtern, AntsGridComponent } from '../ants-grid/ants-grid.component';
import { DialogComponent } from '../dialog-box/dialog-component';
import { DashboardComponent } from '../../dashboard/main/dashboard/dashboard.component';
import { moment } from 'ngx-bootstrap/chronos/test/chain';

@Component({
  selector: 'ts-editor',
  styleUrls: ['ts-editor.css'],
  templateUrl: 'ts-editor.html'
})

export class TsEditorComponent implements OnChanges, OnInit {
  @Input() testScenario: TestScenario;

  @ViewChildren(EditMaskTabComponent) tabs: QueryList<EditMaskTabComponent>;
  @ViewChild(DialogComponent) errorMsg: DialogComponent;

  @Output() updateScenario: EventEmitter<any> = new EventEmitter<any>();

  public title;
  operation;

  private timeScheduleObj: TsController = {
    Name: 'ExecMode',
    DomainType: '1',
    Domain: 'ExecMode',
    PrmList: [
      {
        DefaultValue: '1',
        Description: '',
        Id: '',
        Name: 'ExecMode',
        Value: '1',
      }
    ]
  };
  public showMessage = false;
  public messageLog = '';
  public saveLabelBtn = '';
  public maskName = 'ts-editor';
  public tcs;
  public qtcs;

  constructor(private tsEditorModalService: ModalService, private apiService: ApiService) {}

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.testScenario !== null) {
      this.tcs = (this.testScenario.TcColl[0]) ? this.testScenario.TcColl[0] : null;
      if (this.tcs && this.testScenario.TcColl[0].DataTable) {
        this.qtcs = this.testScenario.TcColl[0].DataTable.length;
      } else {
        this.qtcs = 0;
      }
      if (this.qtcs === 1) {
        const t = AntsGridComponent.t;
        t.fillGridExtern(this.testScenario.TcColl[0].DataTable);
      }

      if (changes['testScenario']) {
        if (this.testScenario.TsId) {
          if (this.testScenario.TsId === 'COPY') {
            this.testScenario.TsId = '';
            this.saveLabelBtn = 'Create';
            this.operation = 'copied';
          } else {
            this.saveLabelBtn = 'Save';
            this.operation = 'updated';
          }
        } else {
            this.saveLabelBtn = 'Create';
            this.operation = 'created';
        }
        this.timeScheduleObj.PrmList[0].Value = this.testScenario.TimeSchedule.ExecMode;
        this.setTimeScheduler();
      }

      if (!this.testScenario.TimeSchedule.StartDate) {
        const d: Date = new Date();
        // const dd = moment(d).format('YYYY-MM-DD HH:mm:ss');
        this.testScenario.TimeSchedule.StartDate = d;
      } else {
        const d: Date = new Date(this.testScenario.TimeSchedule.StartDate);
        this.testScenario.TimeSchedule.StartDate = d;
      }
    }
  }

  tsValueChange() {
  }

  updateDynamicDataControl() {
    this.setTimeScheduler();

    if (this.testScenario && this.testScenario.TcColl && this.testScenario.TcColl[0]) {
      this.testScenario.TcColl[0].DataTable = gridExtern;
    }

    // console.log('**************');
    // console.log(JSON.stringify(this.testScenario));
    // console.log('**************');

    this.messageLog = 'Saving...';
    // console.log('test_scenario Attuale', this.testScenario);
    this.showMessage = true;
    // if (!(this.testScenario.TimeSchedule.StartDate instanceof Date)) {
    //   this.testScenario.TimeSchedule.StartDate = null;
      // this.testScenario.TimeSchedule.StartDate = this.toDateString(new Date());
    // } else {
      // this.testScenario.TimeSchedule.StartDate = this.toDateString(this.testScenario.TimeSchedule.StartDate);
    // }

    // chiamata servizio di salvataggio
    this.messageLog = 'Saving...';

    if (this.testScenario.TsId) {
        this.apiService.updateTestScenarioObject(JSON.parse(JSON.stringify(this.testScenario)))
          .subscribe(result => {
            // console.log('UPDATE: ' + JSON.parse(result.text()));
            const rr = JSON.parse(result.text());
            if (rr.RESULT[0].message.toString() === 'OK') {
                this.errorMsg.showErrorMessage('Scenario ' + this.operation, 'Ok', '');

                const t = DashboardComponent.t;
                t.setTimerForRefresh();
            } else {
              this.errorMsg.showErrorMessage('Error', rr.RESULT[0].message.toString(), 'Error');
            }
          },
          error => {
            this.errorMsg.showErrorMessage('Error', error, 'Error');
          });
          this.showMessage = false;
    } else {
      this.apiService.createTestScenarioObject(this.testScenario)
      .subscribe(result => {
        const rr = JSON.parse(result.text());
        if (rr.RESULT[0].message.toString() === 'OK') {
          this.errorMsg.showErrorMessage('Scenario ' + this.operation, 'Ok', '');

          const t = DashboardComponent.t;
          t.setTimerForRefresh();
        } else {
          this.errorMsg.showErrorMessage('Error', rr.RESULT[0].message.toString(), 'Error');
        }
      },
      error => {
        this.errorMsg.showErrorMessage('Error', error, 'Error');
      });
      this.showMessage = false;
    }
  }

  private closeTestScenarioEditor() {
    this.testScenario = null;

    if (this.tabs) {
      this.tabs.forEach(tab => tab.destroyTab());
    }

    // this.updateScenario.emit();
    this.tsEditorModalService.modalDataSent('TS_UPDATE');
    this.tsEditorModalService.modalShow({'modal': 'tsEditor', 'action': 'close'});
}

  private weekSchedUpdate($event) {
    this.testScenario.TimeSchedule.WeekCalendar = $event;
  }

  private toDateString(date: Date) {
    return date.getFullYear() +
        '-' + date.getMonth() +
        '-' + date.getDate() +
        ' ' + date.getHours() +
        ':' + date.getMinutes() +
        ':' + date.getSeconds();
  }

  private setTimeScheduler() {
    switch (this.testScenario.TimeSchedule.ExecMode) {
      case '1': {
        // this.testScenario.TimeSchedule.StartDate = null;

        this.testScenario.TimeSchedule.FreqBase = null;

        this.testScenario.TimeSchedule.SchedIteration = null;
        this.testScenario.TimeSchedule.TotIteration = null;
        this.testScenario.TimeSchedule.WeekCalendar = null;
        break;
      }
      case '2': {
        this.testScenario.TimeSchedule.SchedIteration = null;
        this.testScenario.TimeSchedule.WeekCalendar = null;

        // if (!this.testScenario.TimeSchedule.StartDate) {
        //   this.testScenario.TimeSchedule.StartDate = this.toDateString(new Date());
        // }
        break;
      }
      case '3': {
        this.testScenario.TimeSchedule.WeekCalendar = null;
        break;
      }
      case '4': {
        this.testScenario.TimeSchedule.TotIteration = null;
        this.testScenario.TimeSchedule.SchedIteration = null;
        break;
      }
      case '5': {
        this.testScenario.TimeSchedule.TotIteration = null;
      }
    }
  }
}
