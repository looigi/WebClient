import {Component, Input, OnInit, ViewChild, AfterViewInit, Inject, forwardRef} from '@angular/core';
import {ApiService} from '../../../services/api.service';
import {ModalService} from '../../../services/modal.service';
import {ActivatedRoute, Params} from '@angular/router';
import { GeneralGridComponent } from '../../uc/ants-grid/generalGrid.component';
import { DashboardHeaderComponent } from '../main/header/header.component';

@Component({
  // providers: [GeneralGridComponent],
  selector: 'event-log',
  templateUrl: 'event-log.component.html',
  styleUrls: ['event-log.css']
})

export class EventLogMainComponent implements OnInit, AfterViewInit {
  static t: EventLogMainComponent;

  public message: string;
  public category: string;
  public filter: string;
  public selection = null;
  public maskName = 'event-log';

  public eventLogResult;
  public eventLogInProgress = false;
  conta = 0;

  // @ViewChild('GeneralGridComponent') gridGeneral: GeneralGridComponent;

  constructor(
    private modalService: ModalService,
    private activatedRoute: ActivatedRoute,
    @Inject(forwardRef(() => GeneralGridComponent)) private gridGeneral: GeneralGridComponent
  ) {}

  ngOnInit() {
    EventLogMainComponent.t = this;

    this.category = '';
    this.filter = '';
    this.message = '';

    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.category = params['category'];
      if (this.category !== undefined) {
        this.execSearch();
      }
    });
  }

  ngAfterViewInit() {
    // if (this.conta !== 0) {
      if (this.category !== undefined) {
        this.showWaitIcon();

        this.gridGeneral.reloadGrid(this.maskName, this.message);
      }
    /* } else {
      const t2 = DashboardHeaderComponent.t;
      const s = this.maskName + '_' + t2.returnUserName() + '_PendingRequest';
      localStorage.removeItem(s);

      this.conta = 1;
    } */
  }

  showWaitIcon()  {
    this.eventLogInProgress = true;
  }

  hideWaitIcon()  {
    this.eventLogInProgress = false;
  }

  fillGrid(r: string, d, maskName, ch) {
    if (r.indexOf('ERROR: ') > -1) {
      ch.showAlert(r);
    } else {
      this.eventLogResult = (d) ? d : null;
    }

    // this.eventLogInProgress = false;
    this.gridGeneral.setAutoFit(maskName);
  }

  search(c: string) {
    this.category = c;
    this.execSearch();
  }

  execSearch() {
    this.message = '';
    if (this.filter) {
      this.message += 'message like \'%' + this.filter + '%\'';
    }
    if (this.category) {
     if (!this.message) {
       this.message = 'Category like \'' + this.category + '\'';
     } else {
       this.message += ' And Category like \'' + this.category + '\'';
     }
    }
    if (!this.message) {
      this.message = 'message like \'%%\'';
    }

    this.showWaitIcon();

    this.gridGeneral.reloadGrid(this.maskName, this.message);
  }

  addTodo(s: string) {
    this.filter = s;
    this.execSearch();
  }

  /* getEvents() {
    this.eventLogInProgress = true;

    this.apiService.getViewData('VIEW_HIST_LOG', this.message)
      .map(response => response.json())
      .subscribe(data => {
        if (!data) {
          return;
        }

        this.eventLogResult = (data) ? data : null;
        this.eventLogInProgress = false;
      }, error => {
        console.warn(error);
        this.eventLogInProgress = false;
      });
    this.selection = null;
  } */

  selectionChanged(event) {
    this.selection = event;
  }
}
