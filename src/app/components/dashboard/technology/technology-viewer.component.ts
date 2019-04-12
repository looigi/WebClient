import { Component, OnInit, ElementRef, ViewChild, Inject, forwardRef } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { GeneralGridComponent } from '../../uc/ants-grid/generalGrid.component';
import { DashboardHeaderComponent } from '../main/header/header.component';

@Component({
  selector: 'technology-viewer',
  templateUrl: 'technology-viewer.html'
})

export class TechnologyViewerComponent implements OnInit {
  static t: TechnologyViewerComponent;

  icoPath = 'assets/img/maps/';
  icoCust = {'Critical': 'ant_r.png', 'Ok': 'ant_g.png', 'Unk': 'ant_bn.png'};

  public maskName = 'tech-viewer';
  sitesList;
  dataResult;
  technologyTupleList = [];
  technologyFiltered = [];
  technologyGridProperty = [];
  colTP;

  loadingSites = true;
  loadingTechs = true;

  constructor(
    private apiService: ApiService,
    @Inject(forwardRef(() => GeneralGridComponent)) private gridGeneral2: GeneralGridComponent
  ) {}

  ngOnInit() {
    const t2 = DashboardHeaderComponent.t;
    const s = this.maskName + '_' + t2.returnUserName() + '_PendingRequest';
    localStorage.removeItem(s);

    TechnologyViewerComponent.t = this;

    this.loadingSites = true;
    this.apiService.getSiteList()
      .map(response => response.json())
      .subscribe(data => {
        this.sitesList = data.DataTable;
        this.loadingSites = false;
      }, error => {
        this.sitesList = null;
        this.loadingSites = false;
      });

      this.showWaitIcon();
      // localStorage.setItem(this.maskName + '_persistence', '1');
      this.gridGeneral2.reloadGrid(this.maskName, '');
    }

  showWaitIcon()  {
    this.loadingTechs = true;
  }

  hideWaitIcon()  {
    this.loadingTechs = false;
  }

  fillGrid(r: string, d, maskName, ch) {
    if (r.indexOf('ERROR: ') > -1) {
      ch.showAlert(r);
    } else {
      this.colTP = d.ColumnProperty;
      this.technologyTupleList = d.DataTable;
      this.technologyGridProperty = d.GridProperty;
      this.dataResult = d;
    }

    // this.loadingTechs = false;
    this.gridGeneral2.setAutoFit(maskName);
}

  filterTechnology(bound) {
    this.technologyFiltered = [];
    if (bound) {
      for (let i = 0; i < this.technologyTupleList.length; i++) {
        for (let j = 0; j < bound.length; j++) {
          if (this.technologyTupleList[i].SITE_ID === bound[j]) {
            this.technologyFiltered.push(this.technologyTupleList[i]);
          }
        }
      }
      this.dataResult = {DataTable: this.technologyFiltered, ColumnProperty: this.colTP};
    }
  }
}
