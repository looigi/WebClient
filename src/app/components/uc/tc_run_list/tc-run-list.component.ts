import {Component, OnInit, Input, EventEmitter, Output, SimpleChanges, OnChanges,
  forwardRef, Inject, AfterViewInit, DoCheck} from '@angular/core';
import {State} from '@progress/kendo-data-query';

import {
    DataStateChangeEvent
} from '@progress/kendo-angular-grid';
import {ModalService} from '../../../services/modal.service';
import { GeneralGridComponent } from '../ants-grid/generalGrid.component';
import { DashboardHeaderComponent } from '../../dashboard/main/header/header.component';

@Component({
  selector: 'tc-run-list',
  styleUrls: ['tc-run-list.css'],
  templateUrl: 'tc-run-list.html'
})

export class TCRunListComponent implements OnChanges, OnInit, AfterViewInit, DoCheck {
  static t: TCRunListComponent;

  @Input() filter: string;
  @Input() father: string;
  @Output() itemSelected: EventEmitter<string> = new EventEmitter<string>();

  // @ViewChild(forwardRef(() => TestScenarioComponent)) gridGeneral: TestScenarioComponent;

  public requestInProgress = false;
  public serverResponse;
  private gridState: State;
  public maskName2 = 'tc-run-list';
  public maskName;
  public c: SimpleChanges;
  public isAlreadyLoaded = false;

  constructor(
    private tcRunModalService: ModalService,
    @Inject(forwardRef(() => GeneralGridComponent)) private gridGeneral2: GeneralGridComponent
  ) {
  }

  public newState(state: DataStateChangeEvent): void {
    this.gridState = state;
  }

  public selectionChanged($event): void {
    console.log('TC Sel: ', $event);
    // expose event to parent component
    this.itemSelected.emit({...$event});
  }

  ngOnInit() {
    const t2 = DashboardHeaderComponent.t;
    const s = this.maskName + '_' + t2.returnUserName() + '_PendingRequest';
    localStorage.removeItem(s);

    this.maskName = this.maskName2 + '_' + this.father;
    TCRunListComponent.t = this;

    if (!this.isAlreadyLoaded) {
      this.reloadDatas();
    }
  }

  ngAfterViewInit() {
    // this.reloadDatas();
  }

  ngDoCheck() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.maskName = this.maskName2 + '_' + this.father;
    TCRunListComponent.t = this;

    this.c = changes;

    if (this.isAlreadyLoaded) {
      this.reloadDatas();
    }
  }

  reloadDatas() {
    if (this.c.filter.previousValue !== this.c.filter.currentValue) {
      // this.requestInProgress = true;
      // this.showWaitIcon();

      // alert(daysAgo);

      // localStorage.setItem(this.maskName + '_persistence', '1');
      if (this.c.filter.currentValue.TRAILISDAY) {
        if (this.maskName === 'tc-run-list_adHocTCRun') {
          this.gridGeneral2.reloadGrid(this.maskName, this.c.filter.currentValue.ANTS_ID);
        } else {
          this.gridGeneral2.reloadGrid(this.maskName, 'TS_ID=' + this.c.filter.currentValue.ANTS_ID);
        }
      } else {
        this.gridGeneral2.reloadGrid(this.maskName, this.c.filter.currentValue.ANTS_ID);
      }
    }
  }

  showWaitIcon()  {
    this.requestInProgress = true;
  }

  hideWaitIcon()  {
    this.requestInProgress = false;
  }

  clearGrid() {
    // this.requestInProgress = true;
    this.serverResponse = null;
  }

  fillGrid(r: string, d, maskName, ch) {
    if (r.indexOf('ERROR: ') > -1) {
      ch.showAlert(r);
    } else {
      if (d.DataTable && d.DataTable.length > 0) {
        this.serverResponse = d;
      } else {
        this.serverResponse = null;
      }
    }

    // this.requestInProgress = false;
    this.gridGeneral2.setAutoFit(maskName);

    this.isAlreadyLoaded = true;
  }

  public showDetailInfo($event) {
    this.tcRunModalService.modalShow({'modal': 'tcDetail', 'action': 'open', 'tcRunId': $event['TC_RUN_ID']});
  }
}
