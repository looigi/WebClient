import {Component, OnInit, Input, EventEmitter, Output, SimpleChanges, OnChanges,
  forwardRef, Inject, AfterViewInit} from '@angular/core';
import {State} from '@progress/kendo-data-query';

import {
    DataStateChangeEvent
} from '@progress/kendo-angular-grid';
import {ModalService} from '../../../services/modal.service';
import { GeneralGridComponent } from '../../uc/ants-grid/generalGrid.component';
// import { TestScenarioComponent } from './test-scenario.component';

@Component({
  // providers: [TestScenarioComponent],
  selector: 'adhoc-list-scenario',
  styleUrls: ['adhoc-list-scenario.css'],
  templateUrl: 'adhoc-list-scenario.html'
})

export class AdHocListScenarioComponent implements OnChanges, OnInit, AfterViewInit {
  static t: AdHocListScenarioComponent;

  @Input() filter: string;
  @Output() itemSelected: EventEmitter<string> = new EventEmitter<string>();

  // @ViewChild(forwardRef(() => TestScenarioComponent)) gridGeneral: TestScenarioComponent;

  public requestInProgress = false;
  public serverResponse;
  private gridState: State;
  public maskName = 'adhoc-list-scenario';
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

  selectionChanged($event): void {
    console.log('TC Sel: ', $event);
    // expose event to parent component
    this.itemSelected.emit($event);
  }

  ngOnInit() {
    AdHocListScenarioComponent.t = this;

    if (!this.isAlreadyLoaded) {
      if (this.c.filter.currentValue.ANTS_ID.indexOf('TS') > -1) {
        this.reloadDatas();
      }
    }
  }

  ngAfterViewInit() {
    // this.reloadDatas();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.c = changes;

    if (this.isAlreadyLoaded) {
      if (this.c.filter.currentValue.ANTS_ID.indexOf('TS') > -1) {
        this.reloadDatas();
      }
    }
  }

  reloadDatas() {
    if (this.c.filter.previousValue !== this.c.filter.currentValue) {
      this.requestInProgress = true;
      // this.showWaitIcon();

      // localStorage.setItem(this.maskName + '_persistence', '1');
      this.gridGeneral2.reloadGrid(this.maskName, this.c.filter.currentValue.ANTS_ID);
    }
  }

  showWaitIcon()  {
    this.requestInProgress = true;
  }

  hideWaitIcon()  {
    this.requestInProgress = false;
  }

  fillGrid(r: string, d, maskName, ch) {
    if (r.indexOf('ERROR: ') > -1) {
      ch.showAlert(r);
    } else {
      this.serverResponse = d;
    }

    this.requestInProgress = false;
    this.gridGeneral2.setAutoFit(maskName);

    this.isAlreadyLoaded = true;
  }

  public showDetailInfo($event) {
    this.tcRunModalService.modalShow({'modal': 'tcDetail', 'action': 'open', 'tcRunId': $event['TC_RUN_ID']});
  }
}
