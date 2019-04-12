import {Component, OnInit, ViewChild, ElementRef, Inject, forwardRef, ChangeDetectorRef, AfterViewChecked} from '@angular/core';
import {Params, ActivatedRoute} from '@angular/router';
import {ApiService} from '../../../services/api.service';
import {FilterTime} from '../../../models/filter-time.model';
import { GeneralGridComponent } from '../../uc/ants-grid/generalGrid.component';
import { DatePipe } from '../../../../../node_modules/@angular/common';
import { TCRunListComponent } from '../../uc/tc_run_list/tc-run-list.component';
import { SessionService } from '../../../services/session.service';
import { Observable} from 'rxjs/Rx';
import { DashboardHeaderComponent } from '../main/header/header.component';
import { ReportMapResultsComponent } from './report-map-results.component';
import { rowNum, AntsGridComponent } from '../../uc/ants-grid/ants-grid.component';


@Component({
  styleUrls: ['report.component.css'],
  templateUrl: 'report.component.html'
})

export class ReportMainComponent implements OnInit, AfterViewChecked {
  static t: ReportMainComponent;

  tcRunList = TCRunListComponent.t;
  tc = '';
  public showMap = false;

  public requestInProgress = false;
  public olapId: string;
  public filter: FilterTime = new FilterTime(null, null, null, null);
  public filterLock: boolean;
  public maskName = 'report';

  public gridProperty: any[];
  public columnProperty: any[];
  public reportResult: any;
  public keyDimension: string;
  public measures: string[] = null;
  public measure: string = null;
  filterLockVisible = false;

  public displayReport = '';
  public selection = null;
  public titleReport = '';

  sOlapId;
  sTimeCriteria;
  sDateFrom;
  sDateTo;
  sTimeRange;

  constructor(
    private cdRef: ChangeDetectorRef,
    private apiService: ApiService,
    private sessionService: SessionService,
    private activatedRoute: ActivatedRoute,
    private datePipe: DatePipe,
    @Inject(forwardRef(() => GeneralGridComponent)) private gridGeneral2: GeneralGridComponent
  ) {};

  ngAfterViewChecked() {
    const t = DashboardHeaderComponent.t;
    t.writePageName('Report');
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    const t2 = DashboardHeaderComponent.t;
    const s = this.maskName + '_' + t2.returnUserName() + '_PendingRequest';
    localStorage.removeItem(s);

    ReportMainComponent.t = this;

    const subscribe = Observable.timer(0, 100)
      .take(1)
      .subscribe(() => {
        const t = TCRunListComponent.t;
        if (t) {
          // t.hideWaitIcon();
        }
        subscribe.unsubscribe();
    });


    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.olapId = params['olapId'];
      if (!this.olapId || this.olapId === undefined) {
        return;
      }
      // se non è bloccato il filtro, resetta il suo valore
      if (!this.filterLock) {
        this.filter = new FilterTime(null, null, null, null);
      }
      this.queryResults();
    });
    this.selection = null;
  }

  showWaitIcon()  {
    this.requestInProgress = true;
  }

  hideWaitIcon()  {
    this.requestInProgress = false;
  }

  public loadReport(s) {
    const ss = this.selection;
    const r = '[' + JSON.stringify(ss) + ']';

    let ssss = '';
    ssss += '{';
    ssss += '    \"olapID\": \"' + this.sOlapId + '\",';
    ssss += '    \"timeCriteria\": \"' + this.sTimeCriteria + '\",';
    ssss += '    \"from\": \"' + this.sDateFrom + '\",';
    ssss += '    \"to\": \"' + this.sDateTo + '\",';
    ssss += '    \"timeRange\": \"' + this.sTimeRange + '\",';
    ssss += '    \"filter\": ' + r + ',';
    ssss += '    \"filterAggr\": \"\",';
    ssss += '    \"sessionID\": \"' + this.sessionService.getToken() + '\",';
    ssss += '    \"rows\": \"' + rowNum + '\"';
    ssss += '}';

    // ssss = JSON.parse(ssss);

    // ssss = JSON.stringify(ssss);
    // alert(ss);
    // const t = TCRunListComponent.t;
    // if (t) {
    //   t.showWaitIcon();
    // }

    // localStorage.setItem(this.maskName + '_persistence', '1');
    this.gridGeneral2.reloadGrid(this.maskName + '_tcrunlist', ssss);

    const t = ReportMapResultsComponent.t;
    const ll = ss.latitude + ';' + ss.longitude + ';';
    t.getCenter(ll);
  }

  fillGrid(r: string, d, maskName, ch) {
    if (r.indexOf('ERROR: ') > -1) {
      ch.showAlert(r);
    } else {
      this.filter = new FilterTime(d.FilterCriteria.TimeCriteria, new Date(d.FilterCriteria.DateFrom),
        new Date(d.FilterCriteria.DateTo), d.FilterCriteria.TimeRange);
      this.gridProperty = (d.Results.GridProperty) ? d.Results.GridProperty : null;
      this.columnProperty = (d.Results.ColumnProperty) ? d.Results.ColumnProperty : null;
      this.keyDimension = this.columnProperty.filter(dim => dim['displayAs'].includes('Dimension')).map(dim => dim['key']).toString();
      this.measures = this.columnProperty.filter(msr => msr['displayAs'] === 'Measure.Value').map(msr => msr['key']);
      this.reportResult = (d.Results) ? d.Results : null;

      if (this.reportResult.DataTable) {
        this.resultDispatch();
        this.measure = this.measures[0];
      }
    }

    this.gridGeneral2.setAutoFit(maskName);
  }

  // Evento sollevato dal refresh del filtro
  queryFilter(filter) {
    this.filter = filter;
    this.queryResults();
  }

  // Evento sollevato dalla selezione del TimeCriteria
  showFilterLock(visible) {
    this.filterLockVisible = visible;
  }

  // Richiesta dati OLAP
  queryResults() {
    this.showWaitIcon();

    const t = TCRunListComponent.t;
    if (t) {
      t.clearGrid();
    }

    const params = <any>{'olapId': this.olapId};
    // TODO rimuovere il workaround
    // WORKAROUND
    if (this.filter.timeCriteria != null) {
      params.timeCriteria = this.filter.timeCriteria;
      if (this.filter.dateFrom) {
        params.from = this.filter.dateFrom.toDateString();
      } else {
        params.from = '';
      }
      if (this.filter.dateTo) {
        params.to = this.filter.dateTo.toDateString();
      } else {
        params.to = '';
      }
      params.timeRange = this.filter.timeRange;
    }

    // /WORKAROUND
    if (params.from === undefined) { params.from = ''; }
    if (params.to === undefined) { params.to = ''; }

    this.apiService.getReportResults(params)
      .map(response => response.json())
      .subscribe(data => {
        this.requestInProgress = false;
        if (!data) {
          return;
        }

        this.filter = new FilterTime(data.FilterCriteria.TimeCriteria, new Date(data.FilterCriteria.DateFrom),
          new Date(data.FilterCriteria.DateTo), data.FilterCriteria.TimeRange);
        this.gridProperty = (data.Results.GridProperty) ? data.Results.GridProperty : null;
        this.columnProperty = (data.Results.ColumnProperty) ? data.Results.ColumnProperty : null;
        try {
          this.keyDimension = this.columnProperty.filter(dim => dim['displayAs'].includes('Dimension')).map(dim => dim['key']).toString();
        } catch (e) {
          const a = 0;
        }
        try {
          this.measures = this.columnProperty.filter(msr => msr['displayAs'] === 'Measure.Value').map(msr => msr['key']);
        } catch (e) {
          const a = 0;
        }

        this.reportResult = (data.Results)  ? data.Results : null;

        if (data && data.Results && data.Results.GridProperty[0]) {
          if (data.Results.GridProperty[0].reportType === 'Map') {
            this.showMap = true;
          } else {
            this.showMap = false;
          }
        } else {
          this.showMap = false;
        }

        /* if (data.FilterCriteria.TimeCriteria === 'DataRange') {
          this.titleReport = params.olapId + ' - ' + data.FilterCriteria.TimeCriteria + ': '
            + ': ' + data.FilterCriteria.DateFrom + ' ' + data.FilterCriteria.DateTo;
        } else {
        } */
        this.titleReport = params.olapId + ' ' + data.Results.TimeRange[0].DateFrom + ' To ' + data.Results.TimeRange[0].DateTo;

        this.sOlapId = params.olapId;
        this.sTimeCriteria = data.FilterCriteria.TimeCriteria;

        let date: Date = new Date(data.Results.TimeRange[0].DateFrom);
        // let sDate: string = this.datePipe.transform(date, 'EEE MMM dd yyyy');
        let sDate: string = this.datePipe.transform(date, 'yyyy-MM-dd hh:mm:ss');
        this.sDateFrom = sDate;

        date = new Date(data.Results.TimeRange[0].DateTo);
        // sDate = this.datePipe.transform(date, 'EEE MMM dd yyyy');
        sDate = this.datePipe.transform(date, 'yyyy-MM-dd hh:mm:ss');
        this.sDateTo = sDate;

        this.sTimeRange = data.FilterCriteria.TimeRange;

        // this.sDateFrom = this.sDateFrom.replace(' ', '%20');
        // this.sDateTo = this.sDateTo.replace(' ', '%20');

        // try {
          if (this.reportResult === undefined || this.reportResult.ColumnProperty.length === 0) {
            this.reportResult = this.CreateEmptyGrid(this.maskName);
          }

          if (this.reportResult) {
            if (this.reportResult !== undefined) {
              if (this.reportResult.DataTable) {
                this.requestInProgress = false;
                this.resultDispatch();
                this.measure = this.measures[0];
              } else {
                this.requestInProgress = false;
                return;
              }
            } else {
              this.requestInProgress = false;
              return;
            }
          } else {
            this.requestInProgress = false;
            return;
          }
        // } catch (e) {

        // }
      }, error => {
         console.warn('ERRORE: ', error);
         this.requestInProgress = false;
    });

  }

  CreateEmptyGrid(maskName) {
    // console.log('Create empty grid: ' + maskName);

    let s: string;
    s = '{"ColumnProperty":';
    s += '[{"headerText":"Empty","key":"Empty","dataType":"number","width":"*"';
    s += ',"place":"01","Icon":null,"hide":"false","locked":"true"}], ';
    s += '"DataTable":';
    s += '[{"Empty":"No Values Found"}],';
    s += '"GridProperty":';
    s += '[{"IsFilterDisplayed":"N","GridName":"' + maskName + '","ItemsPerPage":"1","reportType":"Rep"}]';
    s += '}';
    const dd = JSON.parse(s);

    return dd;
  }

  resultDispatch() {
    try {
      const reportType = this.reportResult.GridProperty[0].reportType;
        switch (reportType) {
          case 'Map':
            // VISUALIZZA MAPPA
            const typeGeo = this.columnProperty.filter(prop => ('' + prop.displayAs).includes('Dimension.Geo'));
            if (typeGeo.length === 1) {
              // Una sola proprietà Dimension.Geo "latitudine <separatore> longitudine"
              switch ('' + typeGeo[0].displayAs) {
                case 'Dimension.Geo.LatLng':
                  // Dimension.Geo = "latitudine; longitudine
                  this.reportResult.DataTable.map(coord => {
                    if (coord[typeGeo[0]['key']] && coord[typeGeo[0]['key']] !== null &&
                      coord[typeGeo[0]['key']] !== undefined && coord[typeGeo[0]['key']].indexOf(';') > -1) {
                      coord.latitude = Number(coord[typeGeo[0]['key']].split(';')[0]);
                      coord.longitude = Number(coord[typeGeo[0]['key']].split(';')[1]);
                    }
                  });
                  // console.log('Report Modificato', this.reportResult);
                  break;
                // Implementare in caso di altri formati Dimension.Geo
                default:
                  // nessun parsing compatibile... Mappa non visualizzata
                  this.displayReport = null;
                  return;
              }
            } else {
              // Più di una proprietà Dimension.Geo... Da implementare se necessario
            }
            this.displayReport = 'Map';
            break;

          case 'Trend':
            // VISUALIZZA TREND
            this.displayReport = 'Trend';
            break;
        }
    } catch (e) {

    }
  }

  selectMeasure(event) {
    this.measure = event;
    // console.log('Selezione misura',event);
  }

  selectionChanged(event) {
    this.selection = event;
    // console.log('Selezione Riga|Marker|Time',event);
  }
}
