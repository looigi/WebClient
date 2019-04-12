import {HostListener, Component, OnDestroy, OnInit, ViewChild,
   AfterViewChecked, ChangeDetectorRef, Pipe, PipeTransform} from '@angular/core';
import { Router } from '@angular/router';
import {ApiService} from '../../../../services/api.service';
import {SessionService} from '../../../../services/session.service';
import {SimpleTimer} from 'ng2-simple-timer';
import { PopupRequestsComponent } from '../../../uc/popupRequests/popupRequests.component';
import { DialogComponent } from '../../../uc/dialog-box/dialog-component';
import { Observable} from 'rxjs/Rx';
import { GeneralGridComponent } from '../../../uc/ants-grid/generalGrid.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { HeaderComponent } from '@progress/kendo-angular-dateinputs/dist/es2015/calendar/header.component';
import { AntsGridComponent } from 'app/components/uc/ants-grid/ants-grid.component';

@Component({
  selector: 'header-component',
  templateUrl: 'header.component.html'
})

export class DashboardHeaderComponent implements  OnInit, OnDestroy {
  static t: DashboardHeaderComponent;

  static sHideScheduler: string;
  static sHideReport: string;
  static sHideAdhoc: string;
  static sHideSiteCoverage: string;
  static sHideEventLog: string;
  static sHideSimManager: string;
  static sHidePortManager: string;
  static sHideAnalytics: string;
  static sPlatformName: string;
  // static sOpenWindow: string;
  static sUserName: string;
  // static sDateNow: Date = null;
  static sDateNowH: string;
  static sUserData: any = null;
  static sPassword: string;
  static sSymb_TimeStamp: string;
  static sMail: string;

  @ViewChild(DialogComponent) errorMsg: DialogComponent;

  userName;
  sqlString: string;
  user = null;
  userData: any = null;
  // dateNow: Date = null;
  public dateNowH: string;
  timer0Id: string;
  public hideScheduler: string;
  public hideReport: string;
  public hideAdhoc: string;
  public hideSiteCoverage: string;
  public hideEventLog: string;
  public hideSimManager: string;
  public hidePortManager: string;
  public hideAnalytics: string;
  public platformName: string;
  public symb_TimeStamp: string;
  public mail: string;
  public OperatorProfileName: string;
  public GroupName: string;
  public OperatorProfileDescription: string;

  // public openWindow: string;
  showButtons;
  TcRunId;
  AutoLoginKey;
  lastEventSetted;
// public platformData: Date = new Date();

  tooltipRequest = '';
  colorRequest = '#555';
  requests;
  areRequests = false;
  subscribe;
  counter;
  logText;
  logColor;
  logToolTip;
  showLog = false;
  public formName: string;

  constructor(private sessionService: SessionService,
    private apiService: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private st: SimpleTimer) {
      this.counter = 0;
      if (this.subscribe) {
        this.subscribe.unsubscribe();
      }
      this.subscribe = Observable.timer(0, 5000)
        .take(32000)
        .subscribe(() => {
          this.callback();
      });

      this.logText = new Array();
      this.logColor = new Array();
      this.logToolTip = new Array();

      // this.writeLogText('prova 1', '#A99', 'prova 1 tanto simpatica e bella');
      // this.writeLogText('prova 2', '#aa9', 'prova 2 tanto simpatica e bella');
      // this.writeLogText('prova 3', '#A9A', 'prova 3 tanto simpatica e bella');
  }

  setLastEvent(e) {
    this.lastEventSetted = e;
  }

  getLastEvent() {
    return this.lastEventSetted;
  }

  closeLog() {
    this.showLog = !this.showLog;
  }

  public writeLogText(l, c, t) {
    if (this.showLog === false) {
      this.showLog = true;
    }

    /* const logTextClone  = [...this.logText];
    const logColorClone  = [...this.logColor];
    const logTooltipClone  = [...this.logToolTip];

    logTextClone.push(l);
    logColorClone.push(c);
    logTooltipClone.push(t);

    const logTextClone2 = new Array();
    const logColorClone2 = new Array();
    const logTooltipClone2 = new Array();

    let index = logTextClone.length - 1;
    while (index > -1) {
      logTextClone2.push(logTextClone[index]);
      logColorClone2.push(logColorClone[index]);
      logTooltipClone2.push(logTooltipClone[index]);

      index--;
    }

    this.logText  = [...logTextClone2];
    this.logColor  = [...logColorClone2];
    this.logToolTip  = [...logTooltipClone2]; */

    this.logText.push(l);
    this.logColor.push(c);
    this.logToolTip.push(t);
  }

  getLogColor(i) {
    const t = this.logText.length - 1;

    return this.logColor[t - i];
  }

  getLogToolTip(i) {
    const t = this.logText.length - 1;

    return this.logToolTip[t - i];
  }

  public writePageName(s: string) {
    this.formName = ' ' + s;
    this.cdr.detectChanges();
  }

  private logout() {
    const rowsModified = AntsGridComponent.rowsModified;
    let Ok = false;

    if (rowsModified === true) {
      if (confirm('Are you sure to discard changes ?')) {
        Ok = true;
        AntsGridComponent.rowsModified = false;
      }
    } else {
      Ok = true;
    }

    if (Ok === true) {
      this.apiService.logout()
        .map(response => response.json())
        .subscribe(
          data => {
            this.sessionService.logout();
            this.router.navigateByUrl('/login');
            // forza un 401
            // this.apiService.getUserData().subscribe();
        }, error => {
            // TODO alert error
      });
    }
  }

  public returnUserName() {
    return this.userName;
  }

  public setAutoLogin(b, t, k) {
    /*if (b === true) {
      this.showButtons = false;
      this.TcRunId = t;
      this.AutoLoginKey = k;
    } else {
      this.showButtons = true;
    } */
  }

  /*ngAfterViewInit() {
    this.apiService.getHeaderInfo()
         .map(response => response.json())
         .subscribe(
          data => {
            if (data && data.DataTable) {
               // this.userDataProfile = dataProfile.Table[0];
               this.hideScheduler =  data.DataTable[0].TestScenario;
               this.hideReport =  data.DataTable[0].Olap;
               this.hideAdhoc = data.DataTable[0].NetworkDb;
               this.hideSiteCoveraget = data.DataTable[0].NetworkDb;
               this.hideEventLog = data.DataTable[0].Event;
               this.hideSimManager = data.DataTable[0].Sim;
               this.hidePortManager = data.DataTable[0].Rtu;
               this.platformName =  data.DataTable[0].PlatformName;
               // this.platformData =  data.DataTable[0].PlatformData;
               this.userName = data.DataTable[0].UserName;
               this.hideAnalytics = 'false';
               this.sessionService.setUserName(this.userName);
               this.openWindow = data.DataTable[0].OpenWindow;

               const dateData =  data.DataTable[0].PlatformData.split('-');
               const year = dateData [0];
               const month = dateData [1];
               const day = dateData [2].substring(0, 2);

              // this.platformData = new Date(day + '/' + month + '/' + year +  data.DataTable[0].PlatformData.substring(10)) ;
              // this.dateNow = new Date(this.platformData);

              const date1: string = day + '/' + month + '/' + year +  data.DataTable[0].PlatformData.substring(10);
              this.dateNow = new Date();
              const date2: string = this.dateNow.toString();

              const diffInMs: number = Date.parse(date2) - Date.parse(date1);
              let diffInHours: number = (diffInMs / 1000 / 60 / 60);

              let sign = '';
              if (diffInHours > 0) {
                if (diffInHours > 12) {
                  diffInHours -= 12;
                }
                sign = '+';
              } else {
                sign = '-';
                if (diffInHours < -12) {
                  diffInHours += 12;
                }
              }
              this.dateNowH = sign + Math.round(diffInHours).toString() + 'H';
            }
          }
          ,
           error =>  {
           // TODO alert error
           });

  }

  ngAfterViewChecked() {
  }*/

  ngOnInit() {
    DashboardHeaderComponent.t = this;

    this.hideScheduler = DashboardHeaderComponent.sHideScheduler;
    this.hideReport = DashboardHeaderComponent.sHideReport;
    this.hideAdhoc = DashboardHeaderComponent.sHideAdhoc;
    this.hideSiteCoverage = DashboardHeaderComponent.sHideSiteCoverage;
    this.hideEventLog = DashboardHeaderComponent.sHideEventLog;
    this.hideSimManager = DashboardHeaderComponent.sHideSimManager;
    this.hidePortManager = DashboardHeaderComponent.sHidePortManager;
    this.hideAnalytics = DashboardHeaderComponent.sHideAnalytics;
    this.platformName = DashboardHeaderComponent.sPlatformName;
    // this.openWindow = DashboardHeaderComponent.sOpenWindow;
    this.userName = DashboardHeaderComponent.sUserName;
    this.sessionService.setUserName(this.userName);
    // this.dateNow = DashboardHeaderComponent.sDateNow;
    this.dateNowH = DashboardHeaderComponent.sDateNowH;
    this.userData = DashboardHeaderComponent.sUserData;
    this.symb_TimeStamp = DashboardHeaderComponent.sSymb_TimeStamp;
    this.mail = DashboardHeaderComponent.sMail;
    this.showButtons = true;

    this.checkRequests(false);
    this.checkHour();

    /* this.apiService.getUserData()
      .map(response => response.json())
      .subscribe(
        data => {
            this.userData = data.OPERATOR[0];
          },
        error =>  {
        // TODO alert error
     }); */
    }

    public checkRequests(update) {
      this.apiService.getViewReport()
      .map(response => response.json())
      .subscribe(data => {
        if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
          if (data.DataTable && data.DataTable.length > 0) {
            this.tooltipRequest = 'There are pending request from tests waiting for a user action (' + data.DataTable.length + ')';
            this.colorRequest = '#a00';
            this.requests = data;
            this.areRequests = true;
          } else {
            this.tooltipRequest = 'There are no pending requests';
            this.colorRequest = '#555';
            this.areRequests = false;
            this.requests = this.CreateEmptyGrid();
          }

          if (update) {
            const p = PopupRequestsComponent.p;
            p.openModal(this.requests);
          }
        } else {
          // if (data.RESULT && data.RESULT[0].message.toUpperCase() !== 'ERROR IN LASTDATE') {
          //   alert('ERROR: ' + data.RESULT[0].message);
          // } else {
            if (data.RESULT) {
              const r = data.RESULT[0].message;
              if (r.toUpperCase().indexOf('OBJECT REFERENCE NOT SET TO AN') > -1 ||
                r.toUpperCase().indexOf('YOUR SESSION HAS BEEN KILLED') > -1 ||
                r === 'The connection is closed.') {
                  if (this.showButtons === true) {
                    alert('Session expired');

                    this.apiService.logout()
                      .map(response => response.json())
                      .subscribe(
                        () => {
                          this.sessionService.logout();
                          this.router.navigateByUrl('/login');
                          // forza un 401
                          // this.apiService.getUserData().subscribe();
                        },
                        error => {
                      // TODO alert error
                    });
                  } else {
                    this.router.navigateByUrl('/login');
                  }
              } else {
                const t = GeneralGridComponent.t;
                t.showAlert(r);
              }
            } else {
              const t = GeneralGridComponent.t;
              t.showAlert(data);
            }
          // }
        }
    }, error => {
        console.warn(error);
      });
    }

    public checkHour() {
      this.apiService.getViewPolling()
      .map(response => response.json())
      .subscribe(data => {
        if (data.RESULT && data.RESULT[0].message.toUpperCase() === 'OK') {
          if (data.DataTable && data.DataTable.length > 0) {
            this.dateNowH = data.DataTable[0].SRV_TIME;
          } else {
            this.dateNowH = 'Error: empty result from VIEW';
          }
        } else {
          this.dateNowH = 'Error: bad result from VIEW';
        }
      }, error => {
          console.warn(error);
      });
    }

    CreateEmptyGrid() {
      let s: string;
      s = '{"ColumnProperty":';
      s += '[{"headerText":"Error","key":"Error","dataType":"number","width":"*"';
      s += ',"place":"01","Icon":null,"hide":"false","locked":"true"}], ';
      s += '"DataTable":';
      s += '[{"Error":"No Values Found"}],';
      s += '"GridProperty":';
      s += '[{"IsFilterDisplayed":"N","GridName":"Requests","ItemsPerPage":"1","reportType":"Rep"}]';
      s += '}';
      const dd = JSON.parse(s);

      return dd;
    }

    public getReqColor() {
      return this.colorRequest;
    }

    public openRequests() {
      this.checkRequests(false);

      const p = PopupRequestsComponent.p;
      p.openModal(this.requests);
    }

  callback() {
    if (this.showButtons === true) {
      // if (this.dateNow && this.dateNow !== undefined) {
        // alert('Sto cambiando l\'ora');
        // this.dateNow = new Date();
        this.counter++;
        if (this.counter === 6) {
          this.checkRequests(false);
          this.checkHour();
          this.counter = 0;
        }
      // }
    }
  }

  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }

  resetLayout() {
    if (confirm('The layout will be reset for all the Dashboards and you\'ll be logged out.')) {
      // this.cookieService.deleteAll('/');

      // const now = new Date();
      // this.cookieService.set('clear_all_cookies', 'clear',
      // new Date(now.getTime() * 1000), '/');

      const t = DashboardHeaderComponent.t;

      localStorage.clear();

      this.router.navigate(['/login']);
    }
  }

  about() {
    this.errorMsg.showErrorMessage('', '', 'About');
  }

  changePage(url) {
    const rowsModified = AntsGridComponent.rowsModified;
    let Ok = false;

    if (rowsModified === true) {
      if (confirm('Are you sure to discard changes ?')) {
        Ok = true;
        AntsGridComponent.rowsModified = false;
      }
    } else {
      Ok = true;
    }

    if (Ok === true) {
      this.router.navigate([url]);
    }
  }
}
