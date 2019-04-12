import {
  Component, OnInit, Input, OnChanges,
  SimpleChange,
  Inject,
  forwardRef,
  ChangeDetectorRef,
  AfterViewChecked,
  ElementRef,
  ViewChild,
  Renderer2
} from '@angular/core';
import {ModalService} from '../../../services/modal.service';
import { GeneralGridComponent } from '../../uc/ants-grid/generalGrid.component';
import { environment } from 'environments/environment';

import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import { Observable } from '../../../../../node_modules/rxjs';
import { DashboardComponent } from '../main/dashboard/dashboard.component';
import { DashboardHeaderComponent } from '../main/header/header.component';
import { SessionService } from 'app/services/session.service';
import { ApiService } from 'app/services/api.service';
import { TcRunDetailTraceTreeComponent } from './tc-run-detail-trace-tree';
import { AntsGridComponent } from 'app/components/uc/ants-grid/ants-grid.component';

@Component({
  selector: 'tc-run-detail',
  styles: [`
    /* .tab-content {
      border-left: 1px solid #ddd;
      border-bottom: 1px solid #ddd;
      border-right: 1px solid #ddd;
      padding: 13px;
    } */

    .k-grid {
      min-height: 99%;
      max-height: 99%;
      max-width: 98%;
    }

  `],
  templateUrl: 'tc-run-detail.html'
})

export class TcRunDetailComponent implements OnInit, OnChanges, AfterViewChecked {
  static t: TcRunDetailComponent;

  @ViewChild('Grid3') gridL3: ElementRef;

  @Input() tcRunId;

  public l3Text;

  public tcRunParametersLoading = true;
  public tcRunMeasuresLoading = true;
  public tcRunTreeLoading = true;
  public tcRunL3Loading = true;
  public tcRunDetailL3Loading = true;
  public tcRunFilesLoading = true;
  public requestsLoad = true;

  public tcRunParameters = null;
  public tcRunMeasures = null;
  public tcRunTraceTree = null;
  public tcRunTraceL3Filtered = null;
  public tcRunTraceL3 = null;
  public tcRunDetailL3 = null;
  public tcRunFiles = null;

  public maskName1 = 'tc-run-parameters';
  public maskName2 = 'tc-run-measures';
  public maskName3 = 'tc-run-detail';
  public maskName4 = 'tc-run-files';
  public maskName5 = 'tc-requests';

  public title;

  public url: SafeResourceUrl;
  requests;
  tcStatus;
  tcRunIdGlobal;
  gridL3Html;

  private isAlreadyLoaded = false;

  c: {[propName: string]: SimpleChange};

  constructor(
    private cdRef: ChangeDetectorRef,
    private sessionService: SessionService,
    private apiService: ApiService,
    public sanitizer: DomSanitizer,
    public modalService: ModalService,
    @Inject(forwardRef(() => GeneralGridComponent)) private gridGeneral2: GeneralGridComponent
  ) {}

  ngAfterViewChecked() {
    const t = DashboardHeaderComponent.t;
    t.writePageName('Tc Run Detailed Info');
    this.cdRef.detectChanges();
  }

  ngOnInit() {
    const tt = DashboardHeaderComponent.t;

    if (this.tcRunId) {
      // alert(typeof(this.tcRunId));
      if (typeof(this.tcRunId) === 'string' && this.tcRunId.indexOf('***') > -1) {
         const c = this.tcRunId.split(';');
         const t = c[0].replace('***', '');
         this.tcRunIdGlobal = t;

         this.tcStatus = 'Automatic';

         tt.setAutoLogin(true, this.tcRunIdGlobal, c[1]);
        } else {
          this.tcRunIdGlobal = this.tcRunId.TC_RUN_ID;

          tt.setAutoLogin(false, null, null);
        }
    } else {
      this.tcRunIdGlobal = this.tcRunId.TC_RUN_ID;

      tt.setAutoLogin(false, null, null);
    }

    this.title = 'TC Run ' + this.tcRunIdGlobal;
    TcRunDetailComponent.t = this;

    if (!this.isAlreadyLoaded) {
      if (this.c['tcRunId']) {
        if (this.tcRunIdGlobal) {
          // The BE use a txt file to buffer services responses
          // => call next service after previous responce is ready
          // this.getTcRunParameters();

          if (this.tcRunId.STATUS) {
            this.tcStatus = this.tcRunId.STATUS;
          }

          /* this.tcRunParametersLoading = true;
          this.tcRunMeasuresLoading = true;
          this.tcRunTreeLoading = true;
          this.tcRunL3Loading = true;
          this.tcRunDetailL3Loading = true;
          this.requestsLoad = false;

          if (this.tcStatus === 'Passed' || this.tcStatus === 'Failed' || this.tcStatus === 'Aborted') {
            // localStorage.setItem(this.maskName1 + '_persistence', '1');
            this.gridGeneral2.reloadGrid(this.maskName1, this.tcRunId.TC_RUN_ID);
            this.requests = null;
          } else {
            // localStorage.setItem(this.maskName5 + '_persistence', '1');
            this.gridGeneral2.reloadGrid(this.maskName5, this.tcRunId.TC_RUN_ID);
          } */

          this.loadAll();
        }
      }
    }
  }

  loadAll() {
    this.tcRunParametersLoading = true;
    this.tcRunMeasuresLoading = true;
    this.tcRunTreeLoading = true;
    this.tcRunL3Loading = true;
    this.tcRunDetailL3Loading = true;
    this.tcRunFilesLoading = true;
    this.requestsLoad = true;

    this.tcRunParameters = null;
    this.tcRunMeasures = null;
    this.tcRunTraceL3Filtered = null;
    // this.tcRunTraceL3 = null;
    this.tcRunFiles = null;

    // if (this.tcStatus === 'Passed' || this.tcStatus === 'Failed' || this.tcStatus === 'Aborted' || this.tcStatus === 'Waiting'
    //     || this.tcStatus === 'Submitted' || this.tcStatus === 'Automatic') {
      if (this.tcStatus === 'Automatic') {
        this.gridGeneral2.reloadGrid(this.maskName1, '***' + this.tcRunIdGlobal);
        this.gridGeneral2.reloadGrid(this.maskName2, '***' + this.tcRunIdGlobal);
        this.gridGeneral2.reloadGrid(this.maskName5, '***' + this.tcRunIdGlobal);
        this.gridGeneral2.reloadGrid(this.maskName3 + '_1', '***' + this.tcRunIdGlobal);
        this.gridGeneral2.reloadGrid(this.maskName4, '***' + this.tcRunIdGlobal);
      } else {
        this.gridGeneral2.reloadGrid(this.maskName1, this.tcRunIdGlobal);
        this.gridGeneral2.reloadGrid(this.maskName2, this.tcRunIdGlobal);
        this.gridGeneral2.reloadGrid(this.maskName5, this.tcRunIdGlobal);
        this.gridGeneral2.reloadGrid(this.maskName3 + '_1', this.tcRunIdGlobal);
        this.gridGeneral2.reloadGrid(this.maskName4, this.tcRunIdGlobal);
      }

      const subscribe = Observable.timer(1000, 1000)
        .take(1)
        .subscribe(() => {
          if (this.tcStatus === 'Automatic') {
            this.gridGeneral2.reloadGrid(this.maskName3, '***' + this.tcRunIdGlobal);
          } else {
            this.gridGeneral2.reloadGrid(this.maskName3, this.tcRunIdGlobal);
          }

          subscribe.unsubscribe();
      });

      this.requests = null;
    // } else {
    //   this.gridGeneral2.reloadGrid(this.maskName5, this.tcRunId.TC_RUN_ID);
    // }
  }

  ngOnChanges(changes: {[propName: string]: SimpleChange}) {
    this.c = changes;

    if (this.isAlreadyLoaded) {
      if (changes['tcRunId']) {
        if (this.tcRunIdGlobal) {
          // The BE use a txt file to buffer services responses
          // => call next service after previous responce is ready
          // this.getTcRunParameters();

          if (this.tcRunId.STATUS) {
            this.tcStatus = this.tcRunId.STATUS;
          }

          /* this.tcRunParametersLoading = true;
          this.tcRunMeasuresLoading = true;
          this.tcRunTreeLoading = true;
          this.tcRunL3Loading = true;
          this.requestsLoad = false;

          if (this.tcStatus === 'Passed' || this.tcStatus === 'Failed' || this.tcStatus === 'Aborted') {
            // localStorage.setItem(this.maskName1 + '_persistence', '1');
            this.gridGeneral2.reloadGrid(this.maskName1, this.tcRunId.TC_RUN_ID);
            this.requests = null;
          } else {
            // localStorage.setItem(this.maskName5 + '_persistence', '1');
            this.gridGeneral2.reloadGrid(this.maskName5, this.tcRunId.TC_RUN_ID);
          } */

          this.loadAll();
        }
      }
    }
  }

  fillGridRequests(r: string, d, maskName, ch) {
    if (r.indexOf('ERROR: ') > -1) {
      ch.showAlert(r);
      this.requests = ch.CreateEmptyGrid(maskName);
    } else {
      this.requests = (d) ? d : null;
    }

    this.requestsLoad = true;
    //// this.getTcRunTraceL3Filtered(null, maskName, ch);
    // this.gridGeneral2.reloadGrid(this.maskName1, this.tcRunId.TC_RUN_ID);
  }

  showFile(se) {
    this.url = null;

    const fileName = environment.urlRoot + se.File;
    // const exists = se.Exists;

    // if (exists === 'Y') {
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(fileName);
      // this.url = fileName;
      // alert(this.url);
      /* const re = /(?:\.([^.]+))?$/;
      let ext: string = re.exec(fileName)[1];
      ext = ext.toUpperCase();

      switch (ext) {
        case 'TXT':
          this.http.get(fileName).subscribe(data => {
            this.fileText = data.text();
          });
          break;
      } */
    // }
  }

  fillL3Text(d) {
    let s  = '';
    let indent = '';

    if (this.tcRunDetailL3) {
      this.tcRunDetailL3.forEach(eachObj => {
        if (eachObj.Duration === d) {
          if (eachObj.Message.indexOf('{') > -1) {
            indent += '  ';
          }
          if (eachObj.Message.indexOf('}') > -1) {
            indent = indent.substring(2, indent.length);
          }
          s += (indent + eachObj.Message);
          s += '\n';
        }
      });
    }

    this.l3Text = s;
  }

  /* showWaitIcon()  {
    this.tcRunParametersLoading = true;
    this.tcRunMeasuresLoading = true;
    this.tcRunTreeLoading = true;
    this.tcRunL3Loading = true;
    this.tcRunDetailL3Loading = true;
  }

  hideWaitIcon()  {
    this.tcRunParametersLoading = false;
    this.tcRunMeasuresLoading = false;
    this.tcRunTreeLoading = false;
    this.tcRunL3Loading = false;
    this.tcRunDetailL3Loading = false;
  } */

  fillGridRunParameters(r: string, d, maskName, ch) {
    this.tcRunParametersLoading = false;

    if (r.indexOf('ERROR: ') > -1) {
      ch.showAlert(r);
      this.tcRunParameters = ch.CreateEmptyGrid(maskName);

      // this.isAlreadyLoaded = true;
      // this.gridGeneral2.reloadGrid(this.maskName2, this.tcRunId.TC_RUN_ID);
    } else {
      this.tcRunParameters = (d) ? d : null;

      // if (this.c['tcRunId']) {
        // if (this.tcRunId.TC_RUN_ID) {
          // localStorage.setItem(this.maskName2 + '_persistence', '1');
          // this.gridGeneral2.reloadGrid(this.maskName2, this.tcRunId.TC_RUN_ID);
        // } else {
          // this.tcRunTreeLoading = false;
          // this.tcRunL3Loading = false;
          // this.tcRunDetailL3Loading = false;
        // }
      // } else {
        // this.tcRunTreeLoading = false;
        // this.tcRunL3Loading = false;
        // this.tcRunDetailL3Loading = false;
      // }
    }

    this.gridGeneral2.setAutoFit(maskName);
  }

  fillGridRunMeasures(r: string, d, maskName, ch) {
    this.tcRunMeasuresLoading = false;

    if (r.indexOf('ERROR: ') > -1) {
      ch.showAlert(r);
      this.tcRunMeasures = ch.CreateEmptyGrid(maskName);

      // this.isAlreadyLoaded = true;
      // this.gridGeneral2.reloadGrid(this.maskName3, this.tcRunId.TC_RUN_ID);
    } else {
      this.tcRunMeasures = (d) ? d : null;

      // if (this.c['tcRunId']) {
        // if (this.tcRunId.TC_RUN_ID) {
          // localStorage.setItem(this.maskName3 + '_persistence', '1');
          // this.gridGeneral2.reloadGrid(this.maskName3, this.tcRunId.TC_RUN_ID);
        // } else {
          // this.tcRunTreeLoading = false;
          // this.tcRunL3Loading = false;
          // this.tcRunDetailL3Loading = false;
        // }
      // } else {
        // this.tcRunTreeLoading = false;
        // this.tcRunL3Loading = false;
        // this.tcRunDetailL3Loading = false;
      // }
    }

    this.gridGeneral2.setAutoFit(maskName);
  }

  fillGridRunTrace(r: string, d, maskName, ch) {
    this.tcRunTreeLoading = false;

    if (r.indexOf('ERROR: ') > -1) {
      ch.showAlert(r);
      this.tcRunTraceTree = ch.CreateEmptyGrid(maskName);

      // this.isAlreadyLoaded = true;
      // this.gridGeneral2.reloadGrid(this.maskName3 + '_1', this.tcRunId.TC_RUN_ID);
   } else {
      this.tcRunTraceTree = (d.DataTable) ? d.DataTable : null;

      // if (this.c['tcRunId']) {
        // if (this.tcRunId.TC_RUN_ID) {
          // localStorage.setItem(this.maskName3 + '_persistence', '1');
          // this.gridGeneral2.reloadGrid(this.maskName3 + '_1', this.tcRunId.TC_RUN_ID);
        // } else {
          // this.tcRunL3Loading = false;
          // this.tcRunDetailL3Loading = false;
        // }
      // } else {
        // this.tcRunL3Loading = false;
        // this.tcRunDetailL3Loading = false;
      // }
    }
    this.gridGeneral2.setAutoFit(maskName);
  }

  fillGridRunL3(r: string, d, maskName, ch, d2, d3) {
    this.tcRunL3Loading = false;

    if (r.indexOf('ERROR: ') > -1) {
      ch.showAlert(r);

      this.tcRunTraceL3 = ch.CreateEmptyGrid(maskName);
      this.tcRunDetailL3 = ch.CreateEmptyGrid(maskName);
      this.tcRunFiles = ch.CreateEmptyGrid(maskName);

      // this.isAlreadyLoaded = true;
      // this.getTcRunTraceL3Filtered(null, maskName);
    } else {
      this.tcRunTraceL3 = (d); //  ? d : null;
      this.tcRunDetailL3 = (d2); //   ? d2 : null;
      this.tcRunFiles = (d3); //  ? d3 : null;

      // No filter
      // if (this.c['tcRunId']) {
        // if (this.tcRunId.TC_RUN_ID) {
        //   this.getTcRunTraceL3Filtered(null, maskName, ch);
          // this.gridGeneral2.reloadGrid(this.maskName5, this.tcRunId.TC_RUN_ID);
        // } else {
          // this.tcRunDetailL3Loading = false;
        // }
      // } else {
        // this.tcRunDetailL3Loading = false;
      // }
    }

    this.tcRunFilesLoading = false;
    this.gridGeneral2.setAutoFit(maskName);

    // const t = TcRunDetailTraceTreeComponent.t;
    // t.clickOnLast();
  }

  getTcRunTraceL3Filtered(filter, maskName, ch) {
    try {
      if (this.tcRunTraceL3) {
        let traceFiltered = this.tcRunTraceL3.DataTable;

        for (const key in filter) {
          if (filter[key]) {
            traceFiltered = traceFiltered.filter(row => String(row[key]) === filter[key]);
          }
        }

        this.tcRunTraceL3Filtered = traceFiltered;
      } else {
        this.tcRunTraceL3 = ch.CreateEmptyGrid(maskName);
        this.tcRunTraceL3Filtered = ch.CreateEmptyGrid(maskName);
      }
    } catch (e) {
      const a = 0;
    }
    this.isAlreadyLoaded = true;

    if (this.tcStatus === 'Automatic') {
      this.apiService.logout()
      .map(response => response.json())
      .subscribe(
          data => {
             this.sessionService.logout();
          },
          error => {
      });
    }
  }
}
