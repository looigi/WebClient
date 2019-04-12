import { Injectable, OnInit } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { SessionService } from '../../../services/session.service';
import { TestScenarioComponent } from '../../dashboard/scheduler/test-scenario.component';
import { TCRunListComponent } from '../tc_run_list/tc-run-list.component';
import { EventLogMainComponent } from '../../dashboard/event-log/event-log';
import { PortMainComponent } from '../../dashboard/port-manager/port-manager';
import { SimMainComponent } from '../../dashboard/sim-manager/sim-manager';
import { TechnologyViewerComponent } from '../../dashboard/technology/technology-viewer.component';
import { ReportMainComponent } from '../../dashboard/report/report.component';
import { TcRunDetailComponent } from '../../dashboard/tc-run-detail/tc-run-detail';
import { GridComponent } from '@progress/kendo-angular-grid';
import 'rxjs/add/operator/map';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { AdHocComponent } from '../../dashboard/adhoc/adhoc.component';
import { AdHocListScenarioComponent } from '../../dashboard/adhoc/adhoc-list-scenario.component';
import { daysAgo, SchedulerComponent } from './../../dashboard/scheduler/scheduler.component';
import { TsDetailComponent } from '../../dashboard/ts-detail/ts-detail';
import { DashboardHeaderComponent } from '../../dashboard/main/header/header.component';
import { Observable } from '../../../../../node_modules/rxjs';
import { Router } from '@angular/router';
import { TcRunDetailTraceTreeComponent } from 'app/components/dashboard/tc-run-detail/tc-run-detail-trace-tree';
import { howManyDays, latestIterations, AntsGridComponent } from './ants-grid.component';

@Injectable()

export class GeneralGridComponent implements OnInit {
  static t: GeneralGridComponent;

  gridLocal: GridComponent;
  gridContext: AntsGridComponent;
  myTimer;
  subscribe;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private sessionService: SessionService
  ) {
      // setInterval(() => { this.dateNow = new Date(); }, 1);
    };

  ngOnInit() {
    GeneralGridComponent.t = this;
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  returnParams(maskName: string, params: string) {
    let par = '';
    const t = DashboardHeaderComponent.t;
    const n = t.returnUserName();

    if (n !== undefined) {
      if (params === null) {
        par = localStorage.getItem(t.returnUserName() + '_' + maskName + '_params');
        // localStorage.removeItem(maskName + '_params');
      } else {
        localStorage.setItem(t.returnUserName() + '_' + maskName + '_params', params);
        par = params;
      }
    }

    return par;
  }

  showAlert(r: string) {
    if (r.toUpperCase().indexOf('OBJECT REFERENCE NOT SET TO AN') > -1 ||
        r.toUpperCase().indexOf('YOUR SESSION HAS BEEN KILLED') > -1 ||
        r === 'The connection is closed.') {
      alert('Session expired');

      this.apiService.logout()
      .map(response => response.json())
      .subscribe(
          data => {
             this.sessionService.logout();
             this.router.navigateByUrl('/login');
            // forza un 401
            // this.apiService.getUserData().subscribe();
          },
          error => {
              // TODO alert error
      });
    } else {
      if (r.toUpperCase().indexOf('TRANSACTION OBJECT WHEN THE CONNECTION OBJECT') === -1) {
        alert(r);
      }
    }
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

  fillGridOnRemote(st, t, data, maskName, t2, ng) {
    let data2 = data;

    if (data2 === null || data2 === undefined || !data2.DataTable || data2.DataTable.length === 0) {
      const dd = this.CreateEmptyGrid(maskName);
      data2 = dd;
    }

    switch (ng) {
      case 1:
        t.fillGrid(st, data2, maskName, t2);
        break;
      case 2:
        t.fillGridRunParameters(st, data2, maskName, t2);
        break;
      case 3:
        t.fillGridRunMeasures(st, data2, maskName, t2);
        break;
      case 4:
        t.fillGridRunTrace(st, data2, maskName, t2);
        break;
      case 5:
        t.fillGridRun(st, data2, maskName, t2);
        break;
      case 6:
        t.fillGridRequests(st, data2, maskName, t2);
        break;
    }
  }

  checkTimeStamp(maskName, t2, requestStartTimeStamp: string) {
    let ok = false;
    const s = t2.returnUserName() + '_' + maskName + '_requestStartTimeStamp';

    if (localStorage.getItem(s) === null ||
      localStorage.getItem(s) < requestStartTimeStamp) {
      localStorage.setItem(s, requestStartTimeStamp);
      ok = true;
    }

    return ok;
}

  reloadGrid(maskName: string, params: any) {
    let par = '';
    let t;
    const t2 = DashboardHeaderComponent.t;

    // if (localStorage.getItem(maskName + '_' + t2.returnUserName() + '_loading') === 'true') {
      // alert('Query già partita ' + maskName);
      // return;
    // }

    // alert('Faccio partire ' + maskName);
    // localStorage.setItem(maskName + '_' + t2.returnUserName() + '_loading', 'true');

    if (this.sessionService.getToken() !== null) {
       switch (maskName) {
        case 'tc-scenario':
          t = TestScenarioComponent.t;
          this.incrementPendingRequest(maskName, t, t2);

          par = this.returnParams(maskName, params);

          this.apiService.getTestScenarios(par)
            .map(response => response.json())
            .subscribe(data => {

              if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
                if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
                  this.fillGridOnRemote('OK', t, data, maskName, this, 1);
                } else {
                  this.fillGridOnRemote('ERROR: ' + data.RESULT[0].message, t, null, maskName, this, 1);
                }
              }
              this.decrementPendingRequest(maskName, t, t2);
            }, error => {
              this.fillGridOnRemote('ERROR: ' + error, t, null, maskName, this, 1);
              this.decrementPendingRequest(maskName, t, t2);
              console.warn(error);
            });
            break;
        case 'tc-run-list_scheduler':
          t = TCRunListComponent.t;

          if (t != null) {
            this.incrementPendingRequest(maskName, t, t2);

            par = this.returnParams(maskName, params);

            // if (environment.production) {
              // alert('Ricerca per numero di giorni: ' + daysAgo);
              if (daysAgo > -1) {
                const daysStart = daysAgo;
                const daysEnd = daysAgo - 1;
                par += ' AND (c.end_date between TRUNC(sysdate-' + daysStart + ', \'DD\')';
                par += ' and TRUNC(sysdate - (' + daysEnd + '), \'DD\')';
                if (daysAgo === 0) {
                  par += 'Or c.end_date is null)';
                } else {
                  par += ')';
                }
                // alert(par);
              }
            // }

            this.apiService.getTCRun(par)
            .map(response => response.json())
            .subscribe(data => {
              if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
                if (data === undefined) { data = null; }
                if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
                  this.fillGridOnRemote('OK', t, data, maskName, this, 1);
                } else {
                  this.fillGridOnRemote('ERROR: ' + data.RESULT[0].message, t, null, maskName, this, 1);
                }
              }
              this.decrementPendingRequest(maskName, t, t2);
            }, error => {
                this.fillGridOnRemote('ERROR: ' + error, t, null, maskName, this, 1);
                this.decrementPendingRequest(maskName, t, t2);
                console.warn(error);
            });
          }
          break;
        case 'event-log':
          t = EventLogMainComponent.t;
          this.incrementPendingRequest(maskName, t, t2);

          par = this.returnParams(maskName, params);

          this.apiService.getViewData('VIEW_HIST_LOG', par)
          .map(response => response.json())
          .subscribe(data => {
            if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
              if (data === undefined) {data = null; }
              if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
                this.fillGridOnRemote('OK', t, data, maskName, this, 1);
              } else {
                this.fillGridOnRemote('ERROR: ' + data.RESULT[0].message, t, null, maskName, this, 1);
              }
            }
            this.decrementPendingRequest(maskName, t, t2);
          }, error => {
              this.fillGridOnRemote('ERROR: ' + error, t, null, maskName, this, 1);
              this.decrementPendingRequest(maskName, t, t2);
              console.warn(error);
          });
          break;
        case 'port-manager':
          t = PortMainComponent.t;
          this.incrementPendingRequest(maskName, t, t2);

          par = this.returnParams(maskName, params);

          this.apiService.getViewData('VIEW_PORT_FULL', par)
          .map(response => response.json())
          .subscribe(data => {
            if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
              if (data === undefined) { data = null; }
              if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
                this.fillGridOnRemote('OK', t, data, maskName, this, 1);
              } else {
                this.fillGridOnRemote('ERROR: ' + data.RESULT[0].message, t, null, maskName, this, 1);
              }
            }
            this.decrementPendingRequest(maskName, t, t2);
          }, error => {
              this.fillGridOnRemote('ERROR: ' + error, t, null, maskName, this, 1);
              this.decrementPendingRequest(maskName, t, t2);
              console.warn(error);
          });
          break;
        case 'sim-manager':
          t = SimMainComponent.t;
          this.incrementPendingRequest(maskName, t, t2);

          par = this.returnParams(maskName, params);

          this.apiService.getViewData('VIEW_SIM_FULL', par)
            .map(response => response.json())
            .subscribe(data => {
              if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
                if (data === undefined) { data = null; }
                if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
                  this.fillGridOnRemote('OK', t, data, maskName, this, 1);
                } else {
                  this.fillGridOnRemote('ERROR: ' + data.RESULT[0].message, t, null, maskName, this, 1);
                }
              }
              this.decrementPendingRequest(maskName, t, t2);
            }, error => {
              this.fillGridOnRemote('ERROR: ' + error, t, null, maskName, this, 1);
              this.decrementPendingRequest(maskName, t, t2);
              console.warn(error);
          });
          break;
        case 'tech-viewer':
          t = TechnologyViewerComponent.t;
          this.incrementPendingRequest(maskName, t, t2);

          this.apiService.getPlmnTech()
          .map(response => response.json())
          .subscribe(data => {
            if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
              if (data === undefined) { data = null; }
              if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
                this.fillGridOnRemote('OK', t, data, maskName, this, 1);
              } else {
                this.fillGridOnRemote('ERROR: ' + data.RESULT[0].message, t, null, maskName, this, 1);
              }
            }
            this.decrementPendingRequest(maskName, t, t2);
          }, error => {
            this.fillGridOnRemote('ERROR: ' + error, t, null, maskName, this, 1);
            this.decrementPendingRequest(maskName, t, t2);
            console.warn(error);
          });
          break;
        case 'report':
          t = ReportMainComponent.t;
          this.incrementPendingRequest(maskName, t, t2);

          this.apiService.getReportResults(params)
          .map(response => response.json())
          .subscribe(data => {
            if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
              if (data === undefined) { data = null; }
              if (data.Results.RESULT && data.Results.RESULT[0].message.toUpperCase() === 'OK') {
                this.fillGridOnRemote('OK', t, data, maskName, this, 1);
              } else {
                this.fillGridOnRemote('ERROR: ' + data.RESULT[0].message, t, null, maskName, this, 1);
              }
            }
            this.decrementPendingRequest(maskName, t, t2);
          }, error => {
            this.fillGridOnRemote('ERROR: ' + error, t, null, maskName, this, 1);
            this.decrementPendingRequest(maskName, t, t2);
            console.warn(error);
          });
          break;
        case 'tc-run-parameters':
          t = TcRunDetailComponent.t;

          // t.showWaitIcon();
          if (typeof(params) === 'string' && params.indexOf('***') !== -1) {
            par = params.replace('***', '');
          } else {
            par = this.returnParams(maskName, params);
          }

          this.apiService.getViewData('VIEW_TC_RUN_PRM', par)
            .map(response => response.json())
            .subscribe(data => {
              if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
                if (data === undefined) { data = null; }
                if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
                  this.fillGridOnRemote('OK', t, data, maskName, this, 2);
                } else {
                  // t.hideWaitIcon();
                  this.fillGridOnRemote('ERROR: ' + data.RESULT[0].message, t, null, maskName, this, 1);
                }
              // } else {
                // t.hideWaitIcon();
              }
            }, error => {
              this.fillGridOnRemote('ERROR: ' + error, t, null, maskName, this, 2);
              console.warn(error);
            });
            break;
        case 'tc-run-measures':
          t = TcRunDetailComponent.t;
          // t.showWaitIcon();

          if (typeof(params) === 'string' && params.indexOf('***') !== -1) {
            par = params.replace('***', '');
          } else {
            par = this.returnParams(maskName, params);
          }

          this.apiService.getViewData('VIEW_TC_RUN_MEASR', par)
            .map(response => response.json())
            .subscribe(data => {
              if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
                if (data === undefined) { data = null; }
                if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
                  this.fillGridOnRemote('OK', t, data, maskName, this, 3);
                } else {
                  // t.hideWaitIcon();
                  this.fillGridOnRemote('ERROR: ' + data.RESULT[0].message, t, null, maskName, this, 1);
                }
              } else {
                // t.hideWaitIcon();
              }
            }, error => {
              this.fillGridOnRemote('ERROR: ' + error, t, null, maskName, this, 3);
              console.warn(error);
            });
            break;
        case 'tc-run-detail':
          t = TcRunDetailComponent.t;
          // t.showWaitIcon();

          if (typeof(params) === 'string' && params.indexOf('***') !== -1) {
            par = params.replace('***', '');
          } else {
            par = this.returnParams(maskName, params);
          }

          this.apiService.getTcRunTraceTreeGet(par)
          .map(response => response.json())
          .subscribe(data => {
            if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
              if (!data || data === undefined) { data = this.CreateEmptyGrid(maskName); }
              if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
                this.fillGridOnRemote('OK', t, data, maskName, this, 4);
                // t.hideWaitIcon();
              } else {
                this.fillGridOnRemote('ERROR: ' + data.RESULT[0].message, t, null, maskName, this, 1);
                // t.hideWaitIcon();
              }
            // } else {
              // t.hideWaitIcon();
            }
          }, error => {
              this.fillGridOnRemote('OK', t, null, maskName, this, 4);
              // t.hideWaitIcon();
              console.warn(error);
            });
            break;
        case 'tc-run-detail_1':
          t = TcRunDetailComponent.t;

          if (typeof(params) === 'string' && params.indexOf('***') !== -1) {
            par = params.replace('***', '');
          } else {
            par = this.returnParams(maskName, params);
          }

          this.apiService.getTcRunTraceL3Get(par)
          .map(response => response.json())
          .subscribe(data => {
            // if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
              if (!data || data === undefined) {
                data = this.CreateEmptyGrid(maskName);
              }
              if (data.Trace.RESULT && data.Trace.RESULT[0].message.toUpperCase() === 'OK') {
                if (!data.Trace || data.Trace === undefined  || data.Trace === undefined || !data.Trace.DataTable ||
                  data.Trace.DataTable.length === 0) {
                  data.Trace = this.CreateEmptyGrid(maskName);
                }
                if (!data.L3Dett || data.L3Dett === undefined) {
                  data.L3Dett = this.CreateEmptyGrid(maskName);
                }
                if (!data.FileList || data.FileList === undefined  || data.FileList === undefined || !data.FileList.DataTable ||
                  data.FileList.DataTable.length === 0) {
                  data.FileList = this.CreateEmptyGrid(maskName);
                }
                t.fillGridRunL3('OK', data.Trace, maskName, this, data.L3Dett, data.FileList);

                this.subscribe = Observable.timer(0, 1000)
                .take(1)
                .subscribe(() => {
                  const tr = TcRunDetailTraceTreeComponent.t;
                  if (tr) {
                    tr.clickOnLast();
                  }
                });

                // t.hideWaitIcon();
              } else {
                // t.hideWaitIcon();
                this.showAlert('ERROR: ' + data.RESULT[0].message);
                // alert('ERROR: ' + data.RESULT[0].message);
                t.fillGridRunL3('OK', null, maskName, this);
              }
            // }
            }, error => {
              t.fillGridRunL3('ERROR: ' + error, null, maskName, this);
              console.warn(error);
            });
            break;
          case 'ts-files':
            t = TsDetailComponent.t;

            par = this.returnParams(maskName, params);

            this.apiService.getTsFiles(par)
            .map(response => response.json())
            .subscribe(data => {
              if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
                if (data === undefined) { data = null; }
                if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
                  this.fillGridOnRemote('OK', t, data, maskName, this, 5);
                } else {
                  // t.hideWaitIcon();
                  this.showAlert('ERROR: ' + data.RESULT[0].message);
                  // alert('ERROR: ' + data.RESULT[0].message);
                  this.fillGridOnRemote('OK', t, null, maskName, this, 5);
                }
              } else {
                t.hideWaitIcon();
              }
            }, error => {
              this.fillGridOnRemote('OK', t, null, maskName, this, 5);
              // t.fillGridRunL3('ERROR: ' + error, null);
              console.warn(error);
            });
            break;
          case 'ad-hoc':
            t = AdHocComponent.t;
            t.showWaitIcon();

            par = this.returnParams(maskName, params);

            this.apiService.getTestScenarios(par)
              .map(response => response.json())
              .subscribe(data => {
                if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
                  if (data === undefined) { data = null; }
                  if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
                    this.fillGridOnRemote('OK', t, data, maskName, this, 1);
                  } else {
                    this.fillGridOnRemote('ERROR: ' + data.RESULT[0].message, t, null, maskName, this, 1);
                    t.hideWaitIcon();
                  }
                } else {
                  t.hideWaitIcon();
                }
              }, error => {
                this.fillGridOnRemote('ERROR: ' + error, t, null, maskName, this, 1);
                console.warn(error);
              });
              break;
          case 'tc-run-list_adHocTCRun':
            t = TCRunListComponent.t;
            t.showWaitIcon();

            par = this.returnParams(maskName, params);
            par = par.replace('TS_RUN_ID', 'D.ID');
            // TS_RUN_ID=2166835 -->
            // D.ID = 2166835

            this.apiService.getTCRun(par)
            .map(response => response.json())
            .subscribe(data => {
              if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
                if (data === undefined) { data = null; }
                if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
                  this.fillGridOnRemote('OK', t, data, maskName, this, 1);
                  t.hideWaitIcon();
                } else {
                  this.fillGridOnRemote('ERROR: ' + data.RESULT[0].message, t, null, maskName, this, 1);
                  t.hideWaitIcon();
                }
              } else {
                t.hideWaitIcon();
              }
          }, error => {
                this.fillGridOnRemote('ERROR: ' + error, t, null, maskName, this, 1);
                console.warn(error);
            });
            break;
          case 'adhoc-list-scenario':
            t = AdHocListScenarioComponent.t;
            t.showWaitIcon();

            par = this.returnParams(maskName, params);
            par = par + ' And ROWNUM <= ' + latestIterations;

            this.apiService.getViewData('VIEW_TS_RUN', par)
              .map(response => response.json())
              .subscribe(data => {
                if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
                  if (data === undefined) { data = null; }
                  if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
                    this.fillGridOnRemote('OK', t, data, maskName, this, 1);
                  } else {
                    t.hideWaitIcon();
                    this.fillGridOnRemote('ERROR: ' + data.RESULT[0].message, t, null, maskName, this, 1);
                  }
                } else {
                  t.hideWaitIcon();
                }
              }, error => {
                this.fillGridOnRemote('ERROR: ' + error, t, null, maskName, this, 1);
                console.warn(error);
              });
              break;
            case 'report_tcrunlist':
            case 'tc-run-list_report':
              t = TCRunListComponent.t;

              par = this.returnParams(maskName, params);

              if (par && par !== undefined) {
                this.incrementPendingRequest(maskName, t, t2);
                this.apiService.getOlapTsRunList(par)
                .map(response => response.json())
                .subscribe(data => {
                  if (this.checkTimeStamp(maskName, t2, data.Results.RESULT[0].requestStartTimeStamp)) {
                    if (data === undefined) { data = null; }
                    if (data.Results.RESULT && data.Results.RESULT[0].message.toUpperCase() === 'OK') {
                      this.fillGridOnRemote('OK', t, data.Results, maskName, this, 1);
                    } else {
                      this.fillGridOnRemote('ERROR: ' + data.RESULT[0].message, t, null, maskName, this, 1);
                    }
                  }
                  this.decrementPendingRequest(maskName, t, t2);
                }, error => {
                  this.fillGridOnRemote('ERROR: ' + error, t, null, maskName, this, 1);
                  this.decrementPendingRequest(maskName, t, t2);
                  console.warn(error);
                });

                this.setAutoFit(maskName);
              }

              break;
            case 'Requests':
              t = this.gridContext;
              if (t !== undefined) {
                par = this.returnParams(maskName, params);

                this.apiService.getRequestParameters(par)
                  .map(response => response.json())
                  .subscribe(data => {
                    if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
                      if (data === undefined || data === null) {
                        data = this.CreateEmptyGrid(maskName);
                        t.fillRequestGrid('OK', data);
                      } else {
                        if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
                          t.fillRequestGrid('OK', data);
                        } else {
                          t.fillRequestGrid('ERROR: ' + data.RESULT[0].message, null);
                        }
                      }
                    }
                  }, error => {
                    t.fillRequestGrid('ERROR: ' + error, null);
                    console.warn(error);
                  });
                } else {
                  this.setAutoFit(maskName);
                }
              break;
            case 'tc-requests':
              t = TcRunDetailComponent.t;
              if (t !== undefined) {
                if (typeof(params) === 'string' && params.indexOf('***') !== -1) {
                  par = params.replace('***', '');
                } else {
                  par = this.returnParams(maskName, params);
                }

                this.apiService.getViewReportWithFilter(par)
                  .map(response => response.json())
                  .subscribe(data => {
                    if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
                      if (data === undefined ) { data = this.CreateEmptyGrid(maskName); }
                      if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
                        this.fillGridOnRemote('OK', t, data, maskName, this, 6);
                      } else {
                        // t.hideWaitIcon();
                        this.fillGridOnRemote('ERROR: ' + data.RESULT[0].message, t, null, maskName, this, 6);
                      }
                    } else {
                      t.hideWaitIcon();
                    }
                  }, error => {
                    this.fillGridOnRemote('ERROR: ' + error, t, null, maskName, this, 6);
                    console.warn(error);
                  });
                } else {
                  this.setAutoFit(maskName);
                }
              break;

            case 'Ts_By_day':
              t = SchedulerComponent.t;
              if (t !== undefined) {
                if (typeof(params) === 'string' && params.indexOf('***') !== -1) {
                  par = params.replace('***', '');
                } else {
                  par = this.returnParams(maskName, params);
                }

                t.showWaitIcon();
                this.apiService.getViewData('VIEW_TS_BY_DAY', 'WHERE ANTS_ID = ' + par + ' AND DAY > SYSDATE - ' + howManyDays)
                .map(response => response.json())
                .subscribe(data => {
                  if (this.checkTimeStamp(maskName, t2, data.RESULT[0].requestStartTimeStamp)) {
                    if (data.DataTable.length === 0) {
                      data = this.CreateEmptyGrid(maskName);
                    }

                    const titleMask = data.GridProperty[0].GridName;
                    const howManyDays = data.GridProperty[0].ShowLastDays;
                    // const a = AntsGridComponent.t;
                    // a.setHowManyDays(howManyDays);

                    t.fillGrid(data, titleMask);
                  }
                }, error => {
                  console.warn('ERRORE: ', error);
                  t.fillGrid(null, '');
                });
              } else {
                this.setAutoFit(maskName);
              }
              break;
        }
      }

    // localStorage.setItem(maskName + '_loading', 'false');
  }

  incrementPendingRequest(maskName, t, t2) {
    const s = t2.returnUserName() + '_' + maskName + '_PendingRequest';
    if (localStorage.getItem(s) === null) {
      localStorage.setItem(s, '1');
    } else {
      let n: number = +localStorage.getItem(s);
      n++;
      localStorage.setItem(s, n.toString());
    }
    this.manageWaitIcon(maskName, t, t2);
  }

 decrementPendingRequest(maskName, t, t2) {
    const s = t2.returnUserName() + '_' + maskName + '_PendingRequest';
    let n: number = +localStorage.getItem(s);
    n--;
    if (n < 0) { n = 0; }
    localStorage.setItem(s, n.toString());

    this.manageWaitIcon(maskName, t, t2);
  }

  manageWaitIcon(maskName, t, t2) {
    const s = t2.returnUserName() + '_' + maskName + '_PendingRequest';
    const n: number = +localStorage.getItem(s);
    if (n === 0) {
      t.hideWaitIcon();
    } else {
      t.showWaitIcon();
    }
  }

  setGridContext(c) {
    this.gridContext = c;
  }

  clearValues(maskName) {
    /* this.myTimer = setTimeout(function tick() {
      clearTimeout(this.myTimer);
      this.dateNow = new Date();
      if (!this.stopTimer) {
        const t = DashboardHeaderComponent.t;

        localStorage.setItem(maskName + '_' + t.returnUserName() + '_loading', 'false');
        if (maskName === 'tc-scenario') {
          localStorage.setItem('tc-run-list_' + t.returnUserName() + '_loading', 'false');
        } else {
          if (maskName === 'report_tcrunlist' || maskName === 'tc-run-list_report') {
            localStorage.setItem('report_' + t.returnUserName() + 'tcrunlist', 'false');
            localStorage.setItem('tc-run-list_' + t.returnUserName() + '_report', 'false');
          }
        }
          }
    }, 3000); */
  }

  setAutoFit(maskName: string) {
    // AntsGridComponent.loading = false;
    // const myVar = setTimeout(() => { this.clearValues(maskName); clearInterval(myVar); }, 1000);

    const subscribe = Observable.timer(0, 1000)
      .take(1)
      .subscribe(() => {
        this.clearValues(maskName);
        subscribe.unsubscribe();
    });

    // alert('Stoppo ' + maskName);
  }
}
