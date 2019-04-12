import {Component, Input, OnInit, ViewChild, ElementRef, Inject, forwardRef, AfterViewChecked, ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import { GeneralGridComponent } from '../../uc/ants-grid/generalGrid.component';
import { DashboardHeaderComponent } from '../main/header/header.component';

@Component({
  selector: 'sim-manager',
  templateUrl: 'sim.component.html',
  styleUrls: ['sim.css']
})

export class SimMainComponent implements OnInit, AfterViewChecked {
  static t: SimMainComponent;

  public message: string;
  public category: string;
  public maskName = 'sim-manager';
  public selection = null;

  public eventSim;
  public eventSimInProgress = false;
  conta = 0;

  @ViewChild('Grid1') grid: ElementRef;

  constructor(
    private cdRef: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    @Inject(forwardRef(() => GeneralGridComponent)) private gridGeneral2: GeneralGridComponent
  ) {}

  ngAfterViewChecked() {
    const t = DashboardHeaderComponent.t;
    t.writePageName('Sim Manager');
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    const t = DashboardHeaderComponent.t;
    t.writePageName('Sim Manager');

    SimMainComponent.t = this;

    this.category = '';
    this.message = '';

    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.category = params['category'];
      if (this.conta !== 0) {
        this.execSearch();
      } else {
        const t2 = DashboardHeaderComponent.t;
        const s = this.maskName + '_' + t2.returnUserName() + '_PendingRequest';
        localStorage.removeItem(s);

        this.conta = 1;
      }
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
       this.message = '\', \' || Category || \',\' like \'%25, ' + this.category + ',%25\'';
     } else {
       this.message += ' And \', \' || Category || \',\' like \'%25, ' + this.category + ',%25\'';
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
    this.eventSimInProgress = true;
  }

  hideWaitIcon()  {
    this.eventSimInProgress = false;
  }

  fillGrid(r: string, d, maskName, ch) {
    if (r.indexOf('ERROR: ') > -1) {
      ch.showAlert(r);
    } else {
      this.eventSim = (d) ? d : null;
    }

    // this.eventSimInProgress = false;
    this.gridGeneral2.setAutoFit(maskName);
  }

  selectionChanged(event) {
    this.selection = event;
  }
}
