import {Component, Input, OnInit, ViewChild, ElementRef, Inject, forwardRef, ChangeDetectorRef, AfterViewChecked} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import { GeneralGridComponent } from '../../uc/ants-grid/generalGrid.component';
import { DashboardHeaderComponent } from '../main/header/header.component';

@Component({
  selector: 'port-manager',
  styleUrls: ['port-manager.css'],
  templateUrl: 'port.component.html'
})

export class PortMainComponent implements OnInit, AfterViewChecked {
  static t: PortMainComponent;

  public message: string;
  public category: string;
  public maskName = 'port-manager';
  public selection = null;

  public eventPort;
  public eventPortInProgress = false;
  conta = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    @Inject(forwardRef(() => GeneralGridComponent)) private gridGeneral2: GeneralGridComponent
  ) {}

  ngAfterViewChecked() {
    const t = DashboardHeaderComponent.t;
    t.writePageName('Port Manager');
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    PortMainComponent.t = this;

    this.category = '';
    this.message = '';

    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.category = params['category'];
      // if (this.category !== undefined && this.category) {
        if (this.conta !== 0) {
          this.execSearch();
        } else {
          const t2 = DashboardHeaderComponent.t;
          const s = this.maskName + '_' + t2.returnUserName() + '_PendingRequest';
          localStorage.removeItem(s);

          this.conta = 1;
        }
      // }
    });

    /* if (this.category !== undefined && this.category) {
      this.execSearch();
    } */
}

  search(c: string) {
    this.category = c;
    this.execSearch();
  }

  execSearch() {
    this.message = '';
    if (this.category) {
      if (!this.message) {
        this.message = 'Category like \'' + this.category + '\'';
      } else {
        this.message += ' And Category like \'' + this.category + '\'';
      }
    }

    this.getEvents();
  }

  getEvents() {
    this.showWaitIcon();
    // localStorage.setItem(this.maskName + '_persistence', '1');
    this.gridGeneral2.reloadGrid(this.maskName, this.message);
  }

  showWaitIcon()  {
    this.eventPortInProgress = true;
  }

  hideWaitIcon()  {
    this.eventPortInProgress = false;
  }

  fillGrid(r: string, d, maskName, ch) {
    if (r.indexOf('ERROR: ') > -1) {
      ch.showAlert(r);
    } else {
      this.eventPort = d;
    }

    // this.eventPortInProgress = false;
    this.gridGeneral2.setAutoFit(maskName);
  }

  selectionChanged(event) {
    this.selection = event;
  }
}

