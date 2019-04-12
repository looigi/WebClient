import {Component, OnInit, Input, EventEmitter, Output,
  OnChanges, SimpleChanges, forwardRef, AfterViewInit, Inject, ElementRef} from '@angular/core';
import {State} from '@progress/kendo-data-query';
import {DataStateChangeEvent} from '@progress/kendo-angular-grid';
import {ApiService} from '../../../services/api.service';
import {Params, ActivatedRoute} from '@angular/router';
import {ModalService} from '../../../services/modal.service';
import { GeneralGridComponent } from '../../uc/ants-grid/generalGrid.component';
import { AntsGridComponent } from '../../uc/ants-grid/ants-grid.component';
import { DashboardHeaderComponent } from '../main/header/header.component';

@Component({
  // providers: [GeneralGridComponent],
  selector: 'test-scenario',
  templateUrl: 'test-scenario.html',
  styleUrls: ['test-scenario.css']
})

export class TestScenarioComponent implements OnChanges, OnInit, AfterViewInit {
  static t: TestScenarioComponent;

  @Input() filter: string;
  @Output() itemSelected: EventEmitter<string> = new EventEmitter<string>();

  // @ViewChild('GeneralGridComponent') gridGeneral2: GeneralGridComponent;

  public dataAdd;
  public title;
  public showAddButton = false;
  public requestInProgress;
  public maskName = 'tc-scenario';
  public serverResponse2;
  private gridState: State;
  private isAlreadyLoaded = false;

  // non più utilizzato
  // @ViewChild(AntsEditModalFormComponent) private editModal: AntsEditModalFormComponent;

  public newState(state: DataStateChangeEvent): void {
    this.gridState = state;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private tsEditorModalService: ModalService,
    @Inject(forwardRef(() => GeneralGridComponent)) private gridGeneral2: GeneralGridComponent
  ) {
  }

  selectionChanged($event): void {
    console.log('TestScenarios: ', $event);
    // expose event to parent component
    this.itemSelected.emit($event);
  }

  ngOnChanges(changes: SimpleChanges) {
    // this.requestInProgress = true;
    AntsGridComponent.pressedTdOnTree = false;

    if (changes['filter']) {
      const folderDesign = /TD_FOLDER='(.*?)'/;
      const testDesign = /TD_NAME='(.*?)'/;
      if (folderDesign.test(this.filter)) {
        if (testDesign.test(this.filter)) {
          this.dataAdd = this.filter.match(testDesign)[1];
          this.title = 'Test Design: ' + this.dataAdd;
          this.showAddButton = true;
          AntsGridComponent.pressedTdOnTree = true;
        } else {
          this.title = 'Folder: ' + this.filter.match(folderDesign)[1];
          this.showAddButton = false;
          AntsGridComponent.pressedTdOnTree = false;
        }
      } else {
        this.title = 'All Test Scenario';
        this.showAddButton = false;
        AntsGridComponent.pressedTdOnTree = false;
      }
    }

    if (this.isAlreadyLoaded) {
      this.activatedRoute.queryParams.subscribe((params: Params) => {
        let p = '';
        if (params !== null) {
          p = params['filter'];
        }
        if (typeof p === 'undefined') {
          p = 'TD_FOLDER is not null';
        }

        const t2 = DashboardHeaderComponent.t;
        const s = t2.returnUserName() + '_' + this.maskName + '_TSSelected';
        if (localStorage.getItem(s) === null || localStorage.getItem(s) !== p) {
          this.showWaitIcon();

          localStorage.setItem(s, p);
          if (p && p !== null || p !== undefined) {
            this.gridGeneral2.reloadGrid(this.maskName, p);
          }
        // } else {
        //  this.hideWaitIcon();
        }
      });
    }
  }

  public editElement($event): void {
    const tsid = $event.dataItem.TS_ID;
    const td_name = $event.dataItem.TD_NAME;
    // spostato su Dashboard
    /*let payload = <any>{};
    payload.title = 'Modifica elemento';
    payload.data = $event;
    this.apiService.getTestScenarioObject({tdName: td_name, tsId: tsid})
      .map(response => response.json())
      .subscribe(result => {
        this.editModal.show(result);
      });*/
    console.log('edit Test Scenario', td_name, tsid);
    this.tsEditorModalService.modalShow({'modal': 'tsEditor', 'action': 'open', 'tdName': td_name, 'tsId': tsid});
  }

  public addElement($event): void {
    const tsid = null;
    if (!$event) {return; }
    const td_name = $event;
    console.log('AGGIUNTA', $event);
    /*let payload = <any>{};
    payload.title = 'Aggiungi elemento';
    payload.data = $event;
    this.apiService.getTestScenarioObject({tdName: td_name, tsId: tsid})
      .map(response => response.json())
      .subscribe(result => {
        this.editModal.show(result);
      });*/
    console.log('edit Test Scenario', td_name, tsid);
    this.tsEditorModalService.modalShow({'modal': 'tsEditor', 'action': 'open', 'tdName': td_name, 'tsId': tsid});
  }

  // 30/03
  delElelemnt($event) {
    console.log('Deleting Test Scenario', $event);
    /*const confirmation = window.confirm('Are sure you want to delete this item ?');
    if (confirmation) {
      this.apiService.deleteTestScenarioObject($event)
        .map(response => response.json())
        .subscribe(
          resp => { console.log(resp); this.ngOnInit(); },
          error => console.log(error)
        );
    }*/
  }

  ngOnInit() {
    const t2 = DashboardHeaderComponent.t;
    const s1 = t2.returnUserName() + '_' + this.maskName + '_PendingRequest';
    localStorage.removeItem(s1);
    const s2 = t2.returnUserName() + '_' + this.maskName + '_TSSelected';
    localStorage.removeItem(s2);

    TestScenarioComponent.t = this;

    if (!this.isAlreadyLoaded) {
      this.activatedRoute.queryParams.subscribe((params: Params) => {
        this.requestInProgress = false;

        let p = '';
        if (params !== null) {
          p = params['filter'];
        }
        if (typeof p !== 'undefined') {
          //  p = 'TD_FOLDER is not null';

          const s = t2.returnUserName() + '_' + this.maskName + '_TSSelected';
          localStorage.setItem(s, p);
          if (p && p !== null || p !== undefined) {
            const t = DashboardHeaderComponent.t;
            const n = t.returnUserName();
            if (n !== undefined) {
              this.gridGeneral2.reloadGrid(this.maskName, p);
            }
          }
        }
      });
    }

    this.isAlreadyLoaded = true;
  }

  ngAfterViewInit() {
    /* if (this.isAlreadyLoaded) {
      this.activatedRoute.queryParams.subscribe((params: Params) => {
        this.showWaitIcon();

        let p = '';
        if (params !== null) {
          p = params['filter'];
        }
        if (typeof p === 'undefined') {
          p = 'TD_FOLDER is not null';
        }

        localStorage.setItem(this.maskName + '_persistence', '1');
        this.gridGeneral2.reloadGrid(this.maskName, p);
      });
    } */
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
      this.serverResponse2 = d;
      this.itemSelected.emit(null);
  }

    // this.requestInProgress = false;
    this.gridGeneral2.setAutoFit(maskName);
    this.isAlreadyLoaded = true;
  }

  /* public loadGrid() {
    this.requestInProgress = true;

    this.serverResponse = null;

    // reset selection at initialization and before any further request
    this.selectionChanged(null);

     // console.log('FILTRO', this.filter);
    // request to webservice
    this.apiService.getTestScenarios(params['filter'])
      .map(response => response.json())
      .subscribe(data => {
        this.serverResponse = data;
        this.requestInProgress = false;
      }, error => {
        this.requestInProgress = false;
        console.warn(error);
      });
  } */
}
