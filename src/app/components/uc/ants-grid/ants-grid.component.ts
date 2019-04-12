import {
  Component, Input, EventEmitter, Output, OnChanges, SimpleChanges, AfterViewChecked, OnInit, AfterViewInit,
  OnDestroy,
  Inject,
  HostListener,
  forwardRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { process, State} from '@progress/kendo-data-query';
import { ModalService } from '../../../services/modal.service';
import { ColumnANTS } from '../../../models/column-ANTS-component';
import { environment } from 'environments/environment';
import { ApiService } from '../../../services/api.service';
import { SessionService } from '../../../services/session.service';
import { TcRunDetailComponent } from '../../dashboard/tc-run-detail/tc-run-detail';
import { TsDetailComponent } from '../../dashboard/ts-detail/ts-detail';
import { GridSettings } from '../../../models/grid-settings.interface';
// import { CookieService } from 'ngx-cookie-service';
import { GridComponent, RowArgs, PageChangeEvent, GridDataResult } from '../../../../../node_modules/@progress/kendo-angular-grid';
import { ReportMainComponent } from '../../dashboard/report/report.component';
import { ColumnSettings } from '../../../models/column-settings.interface';
import { DashboardHeaderComponent } from '../../dashboard/main/header/header.component';
import { GeneralGridComponent } from './generalGrid.component';
import { DialogComponent } from '../dialog-box/dialog-component';
import { Observable } from 'rxjs';
import { DashboardComponent } from '../../dashboard/main/dashboard/dashboard.component';
import { moment } from 'ngx-bootstrap/chronos/test/chain';
import {isNumeric} from 'rxjs/util/isNumeric';

export let gridExtern: any;
export let idPerQuery: string;
export let howManyDays = 30;
export let latestIterations = 100;
export let rowNum = '100';

interface Item {
  text: string;
  value: number;
}

@Component({
  selector: 'ants-grid',
  styleUrls: ['ants-grid.css'],
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'ants-grid.html'
})

export class AntsGridComponent implements OnChanges, OnInit, AfterViewChecked, OnDestroy, AfterViewInit {
  static pressedTdOnTree: boolean;
  static t: AntsGridComponent;
  static rowsModified = false;

  @Input() data;
  @Input() dataAdd;
  @Input() title;
  @Input() icoPath;
  @Input() maskName;
  @Input() editable;
  @Input() minimized;

  @ViewChild('GridGen') gridHTML: GridComponent;

  record = 0;

  // EDITING
  editMode;
  lastEdited = -1;
  gridDataBeforeEditing;
  comboValues = [];
  lookUp;
  checkListRowsSel;
  checkListRowsUnsel;
  colSelected;
  rowSelected;
  editOn = false;
  dontSave = false;
  lookUpValues = [];
  lookUpNames = [];
  // EDITING

  lastPressed = '';
  days = [0, 1, 2, 3, 4, 5, 6, 7];
  days_day = [0];

  @Input()
  set viewRow (num) {
    this.take = num;
  };

  @Input() gridHeight;

  @Input() idProperty;
  @Input() selection;
  @Output() itemSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() stateChanged: EventEmitter<State> = new EventEmitter<State>();
  @Output() editClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() addClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() delClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() detailClicked: EventEmitter<string> = new EventEmitter<string>();

  @ViewChild(DialogComponent) errorMsg: DialogComponent;

  public rowButtonsConfig2 = {
    showHeader: false,
    showAddnew: true,
    showFilter: false,
    showEdit: false,
    showDelete: false,
    showDetails: false,
    showCopy: false,
    showRun: false,
    showPause: false,
    showStop: false,
    showInfo: true,
    showRefresh: false,
    showRequests: false
  };

  showSettedFilter = false;

  columns: ColumnANTS;
  selectedElement;
  selectionIsChanged = false;
  dateNow: Date = new Date();
  timer0Id: string;
  TcRunForParameters;
  // timer1Id: string;
  lastSelected;
  gridData;
  fieldNames: string[];
  public showPopup;
  showCheckList = false;
  public showPopupGrid = false;

  public textInfo;
  // public textInfoGrid;

  public spanIcon;
  // public logText;
  // logColor;
  isPaused;
  public title2;

  public mySelection: number[] = [];

  // public OK_COUNT_LIST: number[];
  // public FAILED_COUNT_LIST: number[];
  // public ABORTED_COUNT_LIST: number[];
  // public DAYS_AGO_LIST: number[];
  // public DIFFERENCE: number[];
  public sOK: number[][];
  public sABORT: number[][];
  public sFAILED: number[][];
  public sOK_DAY: number[][];
  public sABORT_DAY: number[][];
  public sFAILED_DAY: number[][];
  public sOTHER_DAY: number[][];
  // public sDIFFERENCE: number[][];

  public numberOfDays = 0;
  public numberOfLatestIterations = 0;
  public numberOfRows = 2;

  public isAlreadyLoaded = false;

  gridSettings: GridSettings;
  loadedGridSettings;

  requestParameterList;
  showPopupParameters = false;
  lastColor = '#FFF';
  tcRunIdRequest;
  // showPopupRequests = false;

  // @ViewChildren('GridGen') public Grid: GridComponent;
  // @ViewChild('GridGen') elRef: ElementRef;

  private dataTypeEnum = new Map([
    ['string', 'text'],
    ['number', 'numeric'],
    ['date', 'text'],
    ['boolean', 'boolean']
  ]);

  conf = '';

  public take = 25;
  public skip = 0;
  public sort = [];
  public filter = undefined;

  myTimer;
  stopTimer = false;
  timerActive = false;

  // tooltipLogText = '';
  public showRowNum;
  tsRefresh: number = null ;
  subscribe;
  // subscribeGrid;

  // lastMousePosition;
  // divGridPosX;
  // divGridPosY;

  // ICON ON MENU
  styleWithoutIcon1 = {
    'padding-bottom': '2px',
    'overflow': 'hidden'
  };

  styleWithoutIcon2 = {
    'text-align': 'right',
    'white-space': 'nowrap'
  };

  styleWithIcon1 = {
    'text-align': 'left',
    'white-space': 'nowrap',
    'position': 'absolute',
    'left': '3px',
    'overflow': 'auto',
    'max-height': '150px',
    'background-color': '#f6f6f6',
    'width': '30px;',
    'z-index': '1099',
    'display': 'grid',
    'top' : '30px',
    'border': '1px solid #aaa'
  };

  styleWithIcon2 = {
    'text-align': 'right',
    'white-space': 'nowrap',
    'position': 'absolute',
    'right': '20px',
    'overflow': 'auto',
    'max-height': '150px',
    'background-color': '#f6f6f6',
    'width': '30px;',
    'z-index': '1099',
    'display': 'grid',
    'top' : '30px',
    'border': '1px solid #aaa'
  };

  clickOnMenu1 = false;
  clickOnMenu2 = false;
  // minimized = true;
  // ICON ON MENU

  public listItemsPerRowNum: Array<Item> = [
    { text: '50', value: 1 },
    { text: '100', value: 2 },
    { text: '500', value: 3 },
    { text: '1000', value: 4 },
    { text: '5000', value: 5 },
    { text: '10000', value: 6 },
    { text: '20000', value: 7 },
    { text: '50000', value: 8 }
  ];

  public mySelectionKey(context: RowArgs): string {
    const s = context.dataItem.CODE + ' ' +  context.dataItem.ICC_ID + ' ' +
      context.dataItem.ID + ' ' + context.dataItem.TS_ID + ' ' +
      context.dataItem.TC_RUN_ID + ' ' + context.dataItem.TS_RUN_ID;

    if (s !== 'undefined undefined undefined undefined undefined undefined') {
      return s;
    } else {
      return ' ' + context.index;
    }
  }

  setPageNumber(n) {
    this.skip = n;
    this.gridSettings.state.skip = n;
  }

  /* @HostListener('mousemove', ['$event'])
  onMousemove(event: MouseEvent) {
    this.lastMousePosition = event;
  }; */

  constructor(
    private apiService: ApiService,
    private tcRunModalService: ModalService,
    private sessionService: SessionService,
    // private cookieService: CookieService,

    @Inject(forwardRef(() => GeneralGridComponent)) private gridGeneral: GeneralGridComponent
    ) {
      const s: State = { filter: undefined, group: [], skip: 0, sort: [], take: 25 };

      const ccc = Array<ColumnSettings>();
      const cc: ColumnSettings = { field: '',  title: '',  filterable: false,  _width: 40 };
      ccc[0] = cc;

      this.gridSettings = { state: s, filtered: false, columnsConfig: ccc };

      if (this.subscribe) {
        this.subscribe.unsubscribe();
      }
      this.subscribe = Observable.timer(0, 60000)
        .take(32000)
        .subscribe(() => {
          this.callback();
      });
    };

    setHowManyDays(h) {
      if (howManyDays === -1) {
        howManyDays = h;
      }
    }

    // ICON STYLE
    getIconClass1() {
      if (this.minimized === undefined || this.minimized === false) {
        return 'col-md-5 c-slim';
      } else {
        return '';
      }
    }

    getIconClassTit() {
      if (this.minimized === undefined || this.minimized === false) {
        return 'col-md-2 c-slim';
      } else {
        return 'col-md-10 c-slim';
      }
    }

    getIconClass2() {
      if (this.minimized === undefined || this.minimized === false) {
        return 'col-md-5';
      } else {
        return '';
      }
    }

    getIconStyle1() {
      if (this.minimized === undefined || this.minimized === false) {
        return this.styleWithoutIcon1;
      } else {
        return this.styleWithIcon1;
      }
    }

    getIconStyle2() {
      if (this.minimized === undefined || this.minimized === false) {
        return this.styleWithoutIcon2;
      } else {
        return this.styleWithIcon2;
      }
    }

    openCloseMenu1() {
      this.clickOnMenu1 = !this.clickOnMenu1;

      if (this.clickOnMenu1) {
        this.clickOnMenu2 = false;
      }
    }

    openCloseMenu2() {
      this.clickOnMenu2 = !this.clickOnMenu2;

      if (this.clickOnMenu2) {
        this.clickOnMenu1 = false;
      }
    }
    // ICON STYLE

    public mapGridSettings(gridSettings: GridSettings): GridSettings {
      const state = gridSettings.state;

      return {
        state,
        filtered: gridSettings.filtered,
        columnsConfig: gridSettings.columnsConfig.sort((a, b) => a.orderIndex - b.orderIndex),
        // width: gridSettings.width,
        gridData: this.gridData
      };
      // gridData: process(this.gridData, state)
    }

    getCookieValue(name) {
      let s: string;

      /* const cookieExists: boolean = this.cookieService.check(name);
      if (cookieExists) {
        s = this.cookieService.get(name);
      } else {
        s = '';
      } */

      s = localStorage.getItem(name);

      return s;
    }

    readAndSetGridSettings () {
      this.loadedGridSettings = false;

      if (this.maskName === 'report') {
        if (this.title.length > 20) {
          this.title2 = this.title.substring(0, 17) + '...';
        } else {
          this.title2 = this.title;
        }
      } else {
        this.title2 = this.title;
      }

      // const s = localStorage.getItem('gridSettings_' + this.maskName);

      const clearAll = this.getCookieValue('clear_all_cookies');
      const t = DashboardHeaderComponent.t;

      if (clearAll && clearAll === 'clear') {
        localStorage.removeItem( t.returnUserName() + '_grid_' + this.maskName + '_state');
        localStorage.removeItem( t.returnUserName() + '_grid_' + this.maskName + '_filtered');

        const s: State = { filter: undefined, group: [], skip: 0, sort: [], take: 25 };

        const ccc = Array<ColumnSettings>();
        const cc: ColumnSettings = { field: '',  title: '',  filterable: false,  _width: 40 };
        ccc[0] = cc;

        this.gridSettings = { state: s, filtered: false, columnsConfig: ccc };
      } else {
        if (t.returnUserName() !== undefined) {
          const state = this.getCookieValue( t.returnUserName() + '_grid_' + this.maskName + '_state');
          const filtered = this.getCookieValue( t.returnUserName() + '_grid_' + this.maskName + '_filtered');

          if (state) {
            const st: State = JSON.parse(state);
            this.gridSettings.state = st;
          }
          if (filtered) {
            const ft: boolean = JSON.parse(filtered);
            this.gridSettings.filtered = ft;
          }

          if (state && filtered) {
              this.loadedGridSettings = true;
          }
        }

        this.take = this.gridSettings.state.take;
        this.skip = this.gridSettings.state.skip;
        this.sort = this.gridSettings.state.sort;
        this.filter = this.gridSettings.state.filter;

        console.log ('Filtro letto: ');
        console.log(this.filter);

        if (this.filter && this.filter.filters && this.filter.filters.length > 0) {
            this.showSettedFilter = true;
        } else {
          this.showSettedFilter = false;
        }
      }
    }

  ngOnInit() {
    AntsGridComponent.t = this;

    this.onOffKeysOnInit();

    if (!this.icoPath) {
      this.icoPath = 'assets/img/icons/';
    }
  }

  setTimerForRefresh() {
    this.tsRefresh = Date.now();

    if (!this.timerActive) {
      this.timerActive = true;
      this.subscribe = Observable.timer(3000, 3000)
        .take(32000)
        .subscribe(() => {
           this.testRefresh();
      });
    }
  }

  testRefresh() {
    if (this.tsRefresh) {
      const actualDate: number = Date.now();

      const diffInMs: number = actualDate - this.tsRefresh;
      const diffInSeconds: number = diffInMs / 1000;

      if (diffInSeconds > 3) {
        this.tsRefresh = null;
        this.timerActive = false;

        this.reloadGrid();

        this.loadDatas();

        this.subscribe.unsubscribe();
      }
    } else {
      this.timerActive = false;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.readAndSetGridSettings();

    if (this.maskName === 'tc-run-list_report') {
      const tt = DashboardHeaderComponent.t;
      const u = tt.returnUserName();
      if (u !== undefined) {
        const name = tt.returnUserName() + '_grid_' + this.maskName + '_rownum';

        const q = localStorage.getItem(name);
        if (q === undefined || q === null) {
          localStorage.setItem(name, rowNum);
        } else {
          rowNum = q;
        }
        this.listItemsPerRowNum.forEach(element => {
          const testo = element.text;
          const valore = element.value;
          if (testo === rowNum)  {
            this.numberOfRows = valore;
          }
        });
      }
    }

    this.isAlreadyLoaded = false;
    this.numberOfDays = howManyDays;
    this.numberOfLatestIterations = latestIterations;

    // if (this.isAlreadyLoaded) {
      this.onOffKeysOnInit();

      if (changes['data']) {
        if (!this.data) {
          this.gridData = null;
          this.gridDataBeforeEditing = null;
          return;
        }

        for (const key in this.data.GridProperty) {
          if (this.data.GridProperty.hasOwnProperty(key)) {
            this.rowButtonsConfig2[key] = this.data.GridProperty[key];
            if (this.rowButtonsConfig2[key].ItemsPerPage) {
              if (!this.loadedGridSettings) {
                this.take = Number(this.rowButtonsConfig2[key].ItemsPerPage);
              } else {
                this.take = this.gridSettings.state.take;
              }
            }
            if (!this.loadedGridSettings) {
              if (this.rowButtonsConfig2[key] !== undefined) {
                if (this.rowButtonsConfig2[key].IsFilterDisplayed) {
                  switch (this.rowButtonsConfig2[key].IsFilterDisplayed) {
                    case 'Y':
                      this.rowButtonsConfig2.showFilter = true;
                      break;
                    case 'N':
                      this.rowButtonsConfig2.showFilter = false;
                      break;
                  }
                }
              }
            } else {
              this.rowButtonsConfig2.showFilter = this.gridSettings.filtered;
            }
          }
      }

      this.fieldNames = new Array();
      let s = ';';

      if (this.data.DataTable) {
        try {
          this.gridData = this.data.DataTable.map(row => {
            const newRow: Object = {};
            Object.keys(row).forEach(key => {
              let newKey = key.replace('<', '').replace('>', '');
              while (newKey.indexOf('.') > -1) {
                newKey = newKey.replace('.', environment.replaceChar);
              }
              if (s.indexOf(';' + newKey + ';') === -1) {
                s += newKey + ';';
                this.fieldNames.push(newKey);
              }
              newRow[newKey] = row[key];
              });
            return newRow;
          });
        } catch (e) {

        }

        let firstField = JSON.stringify(this.gridData[0]);
        firstField = firstField.replace('{', '');
        firstField = firstField.substring(0, firstField.indexOf(':'));
        while (firstField.indexOf('""') > -1) {
          firstField = firstField.replace('""', '"');
        }
        let gr = JSON.stringify(this.gridData);
        this.record = 0;
        this.lastEdited = -1;
        this.editMode = new Array();
        while (gr.indexOf('{' + firstField + '') > -1) {
          this.editMode.push(false);
          gr = gr.replace('{' + firstField + '', '{"ROW_ID": ' + this.record + ', ' + firstField + '');
          this.record++;
        }
        this.gridData = JSON.parse(gr);
        this.gridDataBeforeEditing = JSON.parse(JSON.stringify(this.gridData));

        this.loadTrailis();

        this.loadTrailis_Day();

        this.lookUpValues = new Array();
        this.lookUpNames = new Array();
        if (this.data.LOOKUP) {
          this.lookUp = this.data.LOOKUP;

          let lastLookUp = '';
          let first = true;
          let ret = '';

          this.lookUp.forEach(element => {
            if (element.CATEGORY === lastLookUp || first) {
              if (first) {
                lastLookUp = element.CATEGORY;
                first = false;
              }

              ret += '{"CATEGORY": "' + element.CATEGORY + '", "VALUE_STR": "' + element.VALUE_STR + '"},';
            } else {
              if (ret.length > 0) {
                ret = '[' + ret.substring(0, ret.length - 1) + ']';
                ret = JSON.parse(ret);
              }

              const n = JSON.parse('[{"CATEGORY": "' + lastLookUp + '"}]');
              this.lookUpNames.push(n);
              this.lookUpValues.push(ret);

              lastLookUp = element.CATEGORY;
              ret = '{"CATEGORY": "' + element.CATEGORY + '", "VALUE_STR": "' + element.VALUE_STR + '"},';
            }
          });

          if (ret.length > 0) {
            ret = '[' + ret.substring(0, ret.length - 1) + ']';
            ret = JSON.parse(ret);
          }

          const n = JSON.parse('[{"CATEGORY": "' + lastLookUp + '"}]');
          this.lookUpNames.push(n);
          this.lookUpValues.push(ret);
        } else {
          this.lookUp = null;
        }

        if (this.data.ColumnProperty && this.data.ColumnProperty !== undefined) {
          try {
            this.columns = this.data.ColumnProperty.map(column => {
              return <ColumnANTS> {
                field: this.changeStringForOrdering(column.key),
                title: this.changeStringForOrdering(column.headerText),
                editor: this.dataTypeEnum.get(column.dataType),
                filter: this.dataTypeEnum.get(column.dataType),
                hidden: this.isColumnHidden(column),
                hiddenLabel: this.isHiddenLabel(column),
                locked: this.isColumnLocked(column),
                icon: this.isIcon(column, column.Icon),
                width: this.columnWidth(column),
                isEditable: this.isEdit(column),
                domain: this.getDomain(column),
                domainType: this.getDomainType(column),
                dataType: column.dataType,
                description: this.getDescription(column)
              };
            });
          } catch (e) {

          }
        }

        if (!this.loadedGridSettings) {
          this.setValuesForPersistance(this.data.ColumnProperty, this.data.GridProperty);
        }
      }

      if (changes['selection']) {
        this.selectionIsChanged = true;
      }

      if (changes['icoPath']) {
        if (!this.icoPath) {
          this.icoPath = 'assets/img/icons/';
        }
      }

      if (this.gridData) {
        this.skip = 0;
        this.gridSettings.state.skip = 0;
      }
    }

    gridExtern = this.gridData;

    this.isAlreadyLoaded = true;
    // alert('Grid data bound');
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
  }

  fillGridExtern(t) {
    gridExtern = t;
  }

  getDescription(ss) {
    const s: string = ss.Description;

    return s;
  }

  getDomain(ss) {
    const s: string = ss.Domain;

    return s;
  }

  getDomainType(ss) {
    const s: string = ss.DomainType;

    return s;
  }

  getComboValues(d) {
    let ret: string = '';
    let index = 0;
    let filled = false;

    this.lookUpNames.forEach(element => {
      if (element[0].CATEGORY === d) {
        if (!filled) {
          filled = true;
          ret = this.lookUpValues[index];
        }
      }
      index++;
    });

    return ret;
  }

  loadTrailis() {
    // Load TRAILIS
    this.sOK = new Array();
    this.sABORT = new Array();
    this.sFAILED = new Array();
    // this.sDIFFERENCE = new Array();

    let index = 0;
    this.data.DataTable.forEach(element => {
      if (element.TRAILIS) {
        this.getOk(element.TRAILIS, index);
        this.getAbort(element.TRAILIS, index);
        this.getFailed(element.TRAILIS, index);
      }

      index++;
    });
    // Load TRAILIS
  }

  loadTrailis_Day() {
    // Load TRAILIS_DAY
    this.sOK_DAY = new Array();
    this.sABORT_DAY = new Array();
    this.sFAILED_DAY = new Array();
    this.sOTHER_DAY = new Array();
    // this.sDIFFERENCE = new Array();

    let index = 0;
    this.data.DataTable.forEach(element => {
      if (element.TRAILISDAY) {
        this.getOk_Day(element.TRAILISDAY, index);
        this.getAbort_Day(element.TRAILISDAY, index);
        this.getFailed_Day(element.TRAILISDAY, index);
        this.getOther_Day(element.TRAILISDAY, index);
      }

      index++;
    });
    // Load TRAILIS_DAY
  }

  setFilter() {
    this.rowButtonsConfig2.showFilter = !this.rowButtonsConfig2.showFilter;
    if (this.rowButtonsConfig2.showFilter) {
      this.gridSettings.filtered = this.rowButtonsConfig2.showFilter;
    } else {
      // this.gridSettings.state.filter.filters = [];
      this.gridSettings.filtered = false;

      // this.reloadGrid();
    }

    this.saveGrid();
  }

  clearFilter() {
    this.rowButtonsConfig2.showFilter = false;
    this.gridSettings.filtered = false;
    this.showSettedFilter = false;

    const s: State = { filter: undefined, group: [], skip: 0, sort: [], take: 25 };

    const ccc = Array<ColumnSettings>();
    const cc: ColumnSettings = { field: '',  title: '',  filterable: false,  _width: 40 };
    ccc[0] = cc;

    this.gridSettings = { state: s, filtered: false, columnsConfig: ccc };

    this.saveGrid();
  }

  setValuesForPersistance(c, g) {
    if (g && g !== null && g[0] !== undefined) {
      const isFiltered: string = g[0].IsFilterDisplayed;
      let filtered: boolean;
      if (isFiltered === 'Y') {
        filtered = true;
      } else {
        filtered = false;
      }

      this.gridSettings.state = { skip: 0, take: g[0].ItemsPerPage, filter: { logic: 'and', filters: [] } };
      /* const ww = Array<number>();
      let index = 0;
      c.forEach(element => {
        let w: number = element.width;
        if (element.width === '*') {
          w = 150;
        }
        ww[index] = w;
        index++;
      });
      this.gridSettings.width = ww; */

      const ccc = Array<ColumnSettings>();
      let index = 0;
      c.forEach(element => {
        const cc: ColumnSettings = { field: element.key, title: element.headerText,
          filter: element.dataType, filterable: filtered, width: -1 };
        ccc[index] = cc;
        index++;
      });
      this.gridSettings.columnsConfig = ccc;

      this.getWidth();
    }
  }

  reloadGridReport() {
    const appo = rowNum;

    rowNum = '-1';

    const tt = ReportMainComponent.t;
    tt.loadReport(null);

    rowNum = appo;

    this.clickOnMenu2 = false;
  }

  updateRowNum(e) {
    rowNum = e.text;
    this.numberOfRows = e.value;

    const t = DashboardHeaderComponent.t;
    localStorage.setItem( t.returnUserName() + '_grid_' + this.maskName + '_rownum', rowNum);

    const tt = ReportMainComponent.t;
    tt.loadReport(null);
  }

  updateDaysAgo() {
    howManyDays = this.numberOfDays;
  }

  updateDaysAgoClick() {
    this.reloadGrid();

    this.clickOnMenu1 = false;
  }

  updateLatestIterations() {
    latestIterations = this.numberOfLatestIterations;
  }

  updateLatestIterationsClick() {
    this.reloadGrid();

    this.clickOnMenu1 = false;
  }

  onClickTrailis(e, c) {
    if (this.lastPressed === '') {
      // 16.65 = dimensioni casella Trailis (130) diviso (numero celle visualizzate (8) + gap (0.4))
      const day = (Math.floor(e.layerX / 16.65));
      // alert('Premuto click. Giorno ' + day);
      // this.loadDayByTrailis(day, c);
    }
    this.lastPressed = '';
  }

  onPlotAreaClick(e, c) {
    // alert('Premuto Plot. Giorno ' + e.category);
    // this.loadDayByTrailis(e.category, c);
    this.lastPressed = 'Plot';
  }

  onOffKeysOnInit() {
    if (this.rowButtonsConfig2) {
      this.rowButtonsConfig2.showAddnew = false;
      this.rowButtonsConfig2.showDetails = false;
      this.rowButtonsConfig2.showDelete = false;
      this.rowButtonsConfig2.showCopy = false;
      this.rowButtonsConfig2.showEdit = false;
      // this.rowButtonsConfig2.showInfo = false;
      this.rowButtonsConfig2.showPause = false;
      this.rowButtonsConfig2.showRun = false;
      this.rowButtonsConfig2.showStop = false;
      this.rowButtonsConfig2.showDetails = false;

      this.rowButtonsConfig2.showHeader = true;
      this.rowButtonsConfig2.showRefresh = true;
      this.showRowNum = false;

      switch (this.maskName) {
        case 'tc-scenario':
          if (AntsGridComponent.pressedTdOnTree) {
            this.rowButtonsConfig2.showAddnew = true;
          }
          break;
        case 'tc-run-list_report':
          this.rowButtonsConfig2.showRefresh = false;
          this.showRowNum = true;
          break;
        case 'report':
        case 'report_tcrunlist':
        case 'technology-viewer':
        case 'tc-run-parameters':
        case 'tc-run-measures':
        case 'tc-run-detail':
        case 'tc-run-files':
        case 'tc-requests':
          this.rowButtonsConfig2.showRefresh = false;
          break;
        case 'ad-hoc':
          this.rowButtonsConfig2.showRequests = true;
          if (AntsGridComponent.pressedTdOnTree) {
            this.rowButtonsConfig2.showAddnew = true;
          }
          // this.checkRequests();
          break;
      }
    // } catch (e) {

    }
  }

  onOffKeysOnSelect() {
    this.onOffKeysOnInit();

    // this.rowButtonsConfig2.showInfo = true;

    const t = DashboardHeaderComponent.t;

    switch (this.maskName) {
      case 'tc-run-list_scheduler':
        this.rowButtonsConfig2.showDetails = true;
        const ss = this.selectedElement.STATUS;
        if (ss !== 'Aborted' && ss !== 'Abort' && ss !== 'Failed' && ss !== 'Passed') {
          this.rowButtonsConfig2.showStop = true;
        }

        break;
      case 'tc-run-list_adHocTCRun':
        this.rowButtonsConfig2.showDetails = true;
        const s = this.selectedElement.STATUS;
        if (s !== 'Aborted' && s !== 'Abort' && s !== 'Failed' && s !== 'Passed') {
          this.rowButtonsConfig2.showStop = true;
        }
        if (s === 'WaitingUserStart' || s === 'Aborted' || s === 'Abort' || s === 'Failed' || s === 'Passed') {
          this.rowButtonsConfig2.showRun = true;
        }

        break;
      case 'tc-run-parameters':
        break;
      case 'tc-run-measures':
        break;
      case 'tc-run-detail':
        break;
      case 'report':
        break;
      case 'technology-viewer':
        this.rowButtonsConfig2.showRefresh = false;
        break;
      case 'tc-run-list_report':
        this.rowButtonsConfig2.showDetails = true;
        break;
      case 'tc-scenario':
        this.rowButtonsConfig2.showEdit = true;
        this.rowButtonsConfig2.showDelete = true;
        this.rowButtonsConfig2.showCopy = true;
        this.rowButtonsConfig2.showRun = true;
        this.rowButtonsConfig2.showPause = true;
        if (this.lastSelected.dataItem.IS_PAUSED === 'Y') {
          this.isPaused = true;
        } else {
          this.isPaused = false;
        }

        // t.checkRequests(false);

        break;
      case 'ad-hoc':
        this.rowButtonsConfig2.showCopy = true;
        this.rowButtonsConfig2.showRun = true;
        this.rowButtonsConfig2.showPause = true;
        if (this.lastSelected.dataItem.IS_PAUSED === 'Y') {
          this.isPaused = true;
        } else {
          this.isPaused = false;
        }
        if (AntsGridComponent.pressedTdOnTree) {
          this.rowButtonsConfig2.showAddnew = true;
        }
        this.rowButtonsConfig2.showDelete = true;
        this.rowButtonsConfig2.showEdit = true;

        // this.checkRequests();
        break;
      case 'adhoc-list-scenario':
        this.rowButtonsConfig2.showDetails = true;

        // t.checkRequests(false);

        break;
    }
  }

  changeStringForOrdering(s) {
    let appo: String;

    appo = s;
    appo = appo.replace('<', '');
    appo = appo.replace('>', '');
    while (appo.indexOf('.') > -1) {
      appo = appo.replace('.', environment.replaceChar);
    }

    // console.log(environment);
    // ONLY FOR DEBUG
    if (environment.production === false) {
      while (appo.indexOf(' ') > -1) {
        appo = appo.replace(' ', '');
      }
    }
    // ONLY FOR DEBUG

    return appo;
  }

  columnWidth(column) {
    /* const cp = this.data['ColumnProperty'];
    let index = 0;
    let index2 = 0;
    let value = -1;
    cp.forEach(element => {
      if (element.key === column.key) {
        index2 = index;
        value = this.gridSettings.width[index];
        if (index === 0) {
          // alert('Dimensioni: ' + value);
        }
      }
      index++;
    }); */

    //  if (this.loadedGridSettings) {
    // if (value === -1) {
      if (column.width) {
        if (column.width === '*') {
          const value = this.calculateTextSize(column);
          // this.gridSettings.width[index2] = value;
          return value;
        } else {
          // this.gridSettings.width[index2] = value;
          return column.width;
        }
      } else {
        return this.calculateTextSize(column);
      }
    // } else {
    //   return value;
    // }
    /* } else {
      if (column.width) {
        if (column.width === '*') {
          return this.calculateTextSize(column);
        } else {
          return column.width;
        }
      } else {
        return this.calculateTextSize(column);
      }
    } */
  }

  calculateTextSize(column) {
    if (column.dataType === 'boolean') {
      return 50;
    }
    if (column.dataType === 'date') {
      return 140;
    }
    if (column.key === 'TRAILIS') {
      return 150;
    }
    if (column.key === 'TRAILISDAY') {
      return 30;
    }

    let s: string;
    s = column.headerText + 'oW';
    if (s) {
      // s =  this.trimFunction(s);
      let key = column.key.replace('<', '').replace('>', '');
      while (key.indexOf('.') > -1) {
        key = key.replace('.', environment.replaceChar);
      }

      if (this.gridData.length > 0) {
        try {
          this.gridData.slice(this.gridSettings.state.skip, this.gridSettings.state.skip +
            this.take - 1)
            .reduce((maxx, curr) => {
              if (curr && curr[key]) {
                const ss: string = curr[key];
                // ss = this.trimFunction(ss);
                if (ss.length > s.length) {
                  s = ss;
                }
              }
              return maxx;
          });
        } catch (e) {

        }

        if (s) {
          // s = s.toUpperCase();
          if (column.Icon) {
            s += 'GGG';
          }
          /* if (!this.isIcon(column.key, column.Icon)) {
          } else {
            if (!column.hiddenLabel) {
              // s += 'GG';
            }
          } */
          if (column.dataType === 'number') {
            s += 'GG';
          }

          /* let ss: string = column.headerText.toString();
          ss = ss.toUpperCase();
          if (ss.indexOf(' NAME') > -1) {
            alert(s);
          } */

          const c = document.createElement('canvas');
          const context = c.getContext('2d');
          context.font = '14px Verdana';

          return context.measureText(s).width;
        } else {
         return 100;
        }
      } else {
        return 100;
      }
    } else {
      return 100;
    }
  }

  trimFunction(s: string) {
    let ss: string = s.toString();
    ss = ss.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    return ss;
  }

  isEdit(column) {
    if (column.IsEditable) { return column.IsEditable === 'true' ? true : false; } else { return false; }
    // return true;
  }

  isColumnLocked(column) {
    if (column.locked) { return column.locked === 'true' ? true : false; } else { return false; }
  }

  isColumnHidden(column) {
    if (column.hide) { return column.hide === 'true' ? true : false; } else { return false; }
  }

  isHiddenLabel(column) {
    if (column.hiddenLabel) { return column.hiddenLabel === 'true' ? true : false; } else { return false; }
  }

  callback() {
    this.dateNow = new Date();
  }

  ngOnDestroy() {
    // this.st.delTimer('5sec');
    clearInterval(this.myTimer);
    this.stopTimer = true;
  }

  ngAfterViewInit() {
  }

  ngAfterViewChecked() {
    // alert('Grid data bound');
  }

  changeCheckBox(e) {
    if (e.IS_ACTIVE === 'N') {
      e.IS_ACTIVE = 'Y';
    } else {
      e.IS_ACTIVE = 'N';
    }
    gridExtern = this.gridData;
  }

  checkedCheckBox() {

  }

  protected dataStateChange(state: State): void {
    this.gridSettings.state = state;
    this.stateChanged.emit(this.gridSettings.state);
    const graphColumns = <any>[];
    graphColumns.push(this.data['ColumnProperty'].find(col => col.key === 'TRAILIS'));
    if (graphColumns[0] !== undefined) {
      graphColumns.map(col => this.renderGraph(col.key));
    }

    this.data.ColumnProperty.map(col => {
      this.calculateTextSize(col);
    });

    this.gridSettings.state = state;
    this.gridSettings.gridData = process(this.gridData, state);
    this.saveGrid();
  // }
  }

  getWidth() {
    /* const h: GridComponent = this.gridHTML;
    if (h) {
      const c = h.columnsContainer.allColumns;
      let index = 0;
      c.forEach(element => {
        const w = element.width;
        if (index > 0) {
          this.gridSettings.width[index - 1] = w;
        }
        index++;
      });
      this.saveGrid();
    } */
  }

  public onResize(e: any): void {
    const cp = this.data['ColumnProperty'];
    let index = 0;
    let value = 0;
    cp.forEach(element => {
      if (element.key === e[0].column.field) {
        value = index;
      }
      index++;
    });

    // this.gridSettings.width[value] = e[0].newWidth;

    // this.saveGrid();
  }

  public onReorder(e: any): void {
    const reorderedColumn = this.gridSettings.columnsConfig.splice(e.oldIndex, 1);
    this.gridSettings.columnsConfig.splice(e.newIndex, 0, ...reorderedColumn);
    this.saveGrid();
  }

  saveGrid(): void {
    // if (this.gridSettings.state.filter.filters[0].value) {
    //   this.gridSettings.state.filter.filters[0].value = new Date(this.gridSettings.state.filter.filters[0].value);
    // }

    const gridConfig = {
      filtered: this.gridSettings.filtered,
      columnsConfig: this.gridSettings.columnsConfig,
      state: this.gridSettings.state,
      // width: this.gridSettings.width
    };

    // alert('Salvo');

    // this.persistingService.set('gridSettings_' + this.maskName, gridConfig, {type: StorageType.LOCAL});
    // localStorage.setItem('gridSettings_' + this.maskName, s);
    let s: string = JSON.stringify(gridConfig.state);

    const now = new Date();
    const t = DashboardHeaderComponent.t;

    // this.cookieService.set( t.returnUserName() + '_grid_' + this.maskName + '_state', s,
    //     new Date(now.getTime() * 1000), '/');

    localStorage.setItem( t.returnUserName() + '_grid_' + this.maskName + '_state', s);

    // s = JSON.stringify(this.filter); // gridConfig.filtered
    // this.cookieService.set('grid_' + this.maskName + '_filter', s,
    //     new Date(now.getTime() * 1000), '/');

    s = JSON.stringify(gridConfig.filtered); // gridConfig.filtered
    // this.cookieService.set( t.returnUserName() + '_grid_' + this.maskName + '_filtered', s,
    //     new Date(now.getTime() * 1000), '/');

    localStorage.setItem( t.returnUserName() + '_grid_' + this.maskName + '_filtered', s);

    this.filter = gridConfig.state.filter;

    // console.log('Filtro scritto:');
    // console.log (this.filter.filters[0].value);

    // s = JSON.stringify(gridConfig.columnsConfig);
    /* let index = 0;
    while (s.length > 1500) {
      this.cookieService.set('grid_' + this.maskName + '_columns_' + index, s.substring(0, 1499),
        new Date(now.getTime() * 1000), '/');
      index++;
      s = s.substring(1500, s.length);
    } */
    // this.cookieService.set('grid_' + this.maskName + '_columns', s,
    //     new Date(now.getTime() * 1000), '/');

    // s = JSON.stringify(gridConfig.width);
    // this.cookieService.set('grid_' + this.maskName + '_width', s);

    if (this.filter && this.filter.filters && this.filter.filters.length > 0) {
      this.showSettedFilter = true;
    } else {
      this.showSettedFilter = false;
    }

    this.loadedGridSettings = true;

    this.clickOnMenu2 = false;
  }

  public resetGrid(): void {
  }

  saveGridValues() {
    // Nome della griglia copiata originale dalla quale fare confronti
    // this.gridDataBeforeEditing
    let index = 0;
    let q = 0;
    let newGrid = '[';
    while (index < this.gridData.length) {
      const element = JSON.stringify(this.gridData[index]);
      const element2 = JSON.stringify(this.gridDataBeforeEditing[index]);
      if (element !== element2) {
        let n = JSON.stringify(element);
        while (n.indexOf('\\') > -1) {
          n = n.replace('\\', '');
        }
        n = n.substring(0, n.length - 1);
        n = n.substring(1, n.length);

        n = n.replace('{"ROW_ID"', '{"CHANGESTATUS":"U", "ROW_ID"');
        newGrid += n + ',';
        q++;
      }
      index++;
    }
    let ng;
    if (newGrid.length > 2) {
      newGrid = newGrid.substring(0, newGrid.length - 1);
      newGrid += ']';

      newGrid = '{ "DataTable": ' + newGrid + '}';
      ng = JSON.parse(newGrid);

      if (q > 0) {
        let viewId = '';

        if (this.maskName === 'sim-manager') {
            viewId = 'VIEW_SIM_FULL';
        }

        this.apiService.getCommitData(viewId, newGrid)
        .map(response => response.json())
        .subscribe(data => {
          if (data.RESULT && data.RESULT[0].Message.toUpperCase() === 'OK') {
            this.gridDataBeforeEditing = JSON.parse(JSON.stringify(this.gridData));

            AntsGridComponent.rowsModified = false;
            // this.lastEdited = -1;

            // alert('Rows saved');
          } else {
            if (data.RESULT !== undefined) {
              alert(data.RESULT[0].Message);
              const rID = data.RESULT[0].RowId;
            } else {
              alert('Error. No response from server');
            }
          }
        }, error => {
          alert('Error: '  + error);
        });
      } else {
        // ng = null;
        alert('Rows edited: 0');
      }

      if (this.lastEdited > -1) {
        this.editMode[this.lastEdited] = false;
      }
      // this.showSave = false;

      this.clickOnMenu1 = false;
    }
  }

  checkIfIsPresentsInList(value, fields) {
    let ret = false;

    fields.forEach(element => {
      if (value.trim() === element.trim()) {
        ret = true;
      }
    });

    return ret;
  }

  updateCheckList(column, value, type, rowID, domain, domainType) {
    this.dontSave = true;
    this.colSelected = column;
    this.rowSelected = rowID;

    let retSel: string = '';
    let retUns: string = '';
    const fields = value.split(',');

    this.lookUp.forEach(element => {
      if (element.CATEGORY === domain) {
        let e = '';
        let checked = 'false';

        if (this.checkIfIsPresentsInList(element.VALUE_STR, fields)) {
          checked = 'true';
          e = '{"CATEGORY": "' + element.CATEGORY + '", "VALUE_STR": "' + element.VALUE_STR + '", "CHECKED": "' + checked + '"},';
          retSel += e;
        } else {
          checked = 'false';
          e = '{"CATEGORY": "' + element.CATEGORY + '", "VALUE_STR": "' + element.VALUE_STR + '", "CHECKED": "' + checked + '"},';
          retUns += e;
        }
      }
    });

    if (retSel.length > 0) {
      retSel = '[' + retSel.substring(0, retSel.length - 1) + ']';
      retSel = JSON.parse(retSel);
      this.checkListRowsSel = retSel;
    } else {
      this.checkListRowsSel = null;
    }

    if (retUns.length > 0) {
      retUns = '[' + retUns.substring(0, retUns.length - 1) + ']';
      retUns = JSON.parse(retUns);
      this.checkListRowsUnsel = retUns;
    } else {
      this.checkListRowsUnsel = null;
    }

    if (this.checkListRowsSel !== null || this.checkListRowsUnsel !== null)  {
      this.orderList();
    }

    this.showCheckList = true;

    this.enableSave();
  }

  orderList() {
    if (this.checkListRowsSel !== null) {
      this.checkListRowsSel.sort(function (a, b) {
        a = a.VALUE_STR;
        b = b.VALUE_STR;
        if (a < b) {
          return -1;
        } else if (a > b) {
          return 1;
        }
        return 0;
      });
    }

    if (this.checkListRowsUnsel !== null) {
        this.checkListRowsUnsel.sort(function (a, b) {
        a = a.VALUE_STR;
        b = b.VALUE_STR;
        if (a < b) {
          return -1;
        } else if (a > b) {
          return 1;
        }
        return 0;
      });
    }
  }

  clickCheckList(selected, field) {
    let retSel: string = '';
    let retUns: string = '';

    if (this.checkListRowsSel !== null) {
      this.checkListRowsSel.forEach(element => {
        let e = '';
        if (element.VALUE_STR === field) {
          if (element.CHECKED === 'true') {
            e = '{"CATEGORY": "' + element.CATEGORY + '", "VALUE_STR": "' + element.VALUE_STR + '", "CHECKED": "false"},';
            retUns += e;
          } else {
            e = '{"CATEGORY": "' + element.CATEGORY + '", "VALUE_STR": "' + element.VALUE_STR + '", "CHECKED": "true"},';
            retSel += e;
          }
        } else {
          e = '{"CATEGORY": "' + element.CATEGORY + '", "VALUE_STR": "' + element.VALUE_STR + '", "CHECKED": "true"},';
          retSel += e;
        }
      });
    }

    if (this.checkListRowsUnsel !== null) {
      this.checkListRowsUnsel.forEach(element => {
        let e = '';
        if (element.VALUE_STR === field) {
          if (element.CHECKED === 'true') {
            e = '{"CATEGORY": "' + element.CATEGORY + '", "VALUE_STR": "' + element.VALUE_STR + '", "CHECKED": "false"},';
            retUns += e;
          } else {
            e = '{"CATEGORY": "' + element.CATEGORY + '", "VALUE_STR": "' + element.VALUE_STR + '", "CHECKED": "true"},';
            retSel += e;
          }
        } else {
          e = '{"CATEGORY": "' + element.CATEGORY + '", "VALUE_STR": "' + element.VALUE_STR + '", "CHECKED": "false"},';
          retUns += e;
        }
      });
    }

    if (retSel.length > 0) {
      retSel = '[' + retSel.substring(0, retSel.length - 1) + ']';
      retSel = JSON.parse(retSel);
      this.checkListRowsSel = retSel;
    } else {
      this.checkListRowsSel = null;
    }

    if (retUns.length > 0) {
      retUns = '[' + retUns.substring(0, retUns.length - 1) + ']';
      retUns = JSON.parse(retUns);
      this.checkListRowsUnsel = retUns;
    } else {
      this.checkListRowsUnsel = null;
    }

    if (this.checkListRowsSel !== null || this.checkListRowsUnsel !== null) {
      this.orderList();
    }
  }

  saveCheckList() {
    let newValue = '';

    if (this.checkListRowsSel !== null) {
      this.checkListRowsSel.forEach(element => {
        // if (element.CHECKED === 'true') {
          newValue += element.VALUE_STR + ',';
        // }
      });
    }
    if (newValue.length > 0) {
      newValue = newValue.substring(0, newValue.length - 1);
    }

    this.putValueInGrid(newValue, this.colSelected, this.rowSelected);

    this.colSelected = '';
    this.rowSelected = '';

    this.showCheckList = false;

    this.enableSave();
  }

  cancelGridValues() {
    if (this.lastEdited > -1) {
      this.editMode[this.lastEdited] = false;
    }
    AntsGridComponent.rowsModified = false;
    this.gridData = JSON.parse(JSON.stringify(this.gridDataBeforeEditing));

    this.clickOnMenu1 = false;
  }

  putValueInGrid(newValue, col, row) {
    this.gridData[row][col] = newValue;

    this.enableSave();
  }

  editGridOnOff() {
    if (this.editOn && AntsGridComponent.rowsModified) {
      if (confirm('Are you sure to discard changes ?')) {
        this.editOn = false;
        AntsGridComponent.rowsModified = false;
      }
    } else {
      this.editOn = !this.editOn;
    }

    if (!this.editOn) {
      this.editMode[this.lastEdited] = false;
      AntsGridComponent.rowsModified = false;
      this.lastEdited = -1;
      this.gridData = JSON.parse(JSON.stringify(this.gridDataBeforeEditing));

      this.clickOnMenu1 = false;
    }
  }

  enableSave() {
    if (AntsGridComponent.rowsModified === false) {
      AntsGridComponent.rowsModified = true;
    }
  }

  protected cellClick(e) {
    // if (localStorage.getItem(this.maskName + '_' + DashboardHeaderComponent.userName + '_loading') === 'false') {
    if (this.editable && this.editOn) {
      if (this.lastEdited > -1) {
        if (AntsGridComponent.rowsModified === true) {
          if (!this.dontSave && this.lastEdited !== e.dataItem.ROW_ID) {
            this.saveGridValues();
          } else {
            this.dontSave = false;
          }
        }

        this.editMode[this.lastEdited] = false;
      }
      this.editMode[e.dataItem.ROW_ID] = !this.editMode[e.dataItem.ROW_ID];
      this.lastEdited = e.dataItem.ROW_ID;

      this.gridGeneral.setAutoFit(this.maskName);
    } else {
      console.log('Cella');
      console.log(e);
      if (e.dataItem.Empty !== 'No Values Found') {
        this.lastSelected = e;

        this.loadDatas();
      }
    }
    // }
  }

  loadDatas() {
    // this.logText = '';

    if (this.maskName !== 'tc-requests') {
      this.itemSelected.emit(this.selectedElement || null);
    }

    this.onOffKeysOnSelect();

    if (this.maskName === 'tc-run-detail') {
      const t = TcRunDetailComponent.t;
      if (this.selectedElement.Protocol === 'L3') {
        t.fillL3Text(this.selectedElement.Duration);
      } else {
        t.fillL3Text('');
      }
    } else {
      if (this.maskName === 'tc-run-files') {
        const t = TcRunDetailComponent.t;
        t.showFile(this.selectedElement);
      } else {
        if (this.maskName === 'ts-files') {
          const t = TsDetailComponent.t;
          t.showFile(this.selectedElement);
        } else {
          if (this.maskName === 'report') {
            const r = ReportMainComponent.t;
            r.loadReport(this.selectedElement);
          } else {
            if (this.maskName === 'Requests' || this.maskName === 'tc-requests') {
              this.loadRequestParameters(this.selectedElement);
            }
          }
        }
      }
    }
  }

  protected selectionChanged(selection): void {
    // console.log('Selection click: ');
    // console.log(selection.selectedRows[0].dataItem);
    this.selectedElement = selection && selection.selected ? selection.selectedRows[0].dataItem : null;
    this.lastSelected = selection.selectedRows[0];
  }

  loadRequestParameters(s) {
    const t = DashboardHeaderComponent.t;
    const ss: string = 'TcRunId=' + s.TC_RUN_ID + ',' + s.TC_RUN_RETRY_NUM + ',' + s.ID;
    this.TcRunForParameters = s.TC_RUN_ID + ',' + s.TC_RUN_RETRY_NUM + ',' + s.ID;
    this.tcRunIdRequest = s.TC_RUN_ID;
    this.gridGeneral.setGridContext(this);
    if (this.maskName === 'tc-requests') {
      this.maskName = 'Requests';
    }
    // localStorage.setItem(t.returnUserName() + '_' + this.maskName + '_persistence', '0');
    this.gridGeneral.reloadGrid(this.maskName, ss);
  }

  fillRequestGrid(s: string, data) {
    if (data) {
      this.requestParameterList = data.TC_RUN_REQ_PRM_OUTPUT;
    } else {
      this.requestParameterList = null;
    }
    this.showPopupParameters = true;
    this.gridGeneral.setAutoFit(this.maskName);
  }

  saveParameters() {
    let s = '';

    s += '{';
    s += '  \"TC_RUN_REQ_PRM_INPUT\": [';

    let ss = '';

    this.requestParameterList.forEach(element => {
      ss += '{';
      ss += ' \"NAME\": \"' + element.NAME + '\",';
      ss += ' \"VALUE\": \"' + element.DEFAULT_NAME + '\",';
      ss += ' \"TYPE\": \"string\"';
      ss += '},';
    });

    if (ss.length > 1) {
      ss = ss.substring(0, ss.length - 1);
    }

    s += ss;

    s += '  ],';
    s += '  \"GENERAL_INFO\": []';
    s += '}';

    s = JSON.parse(s);

    this.apiService.setRequestParameters(this.TcRunForParameters, s)
    .map(response => response.json())
    .subscribe(data => {
      if (data) {
        // alert('Save parameters: OK');
        this.errorMsg.showErrorMessage('Save parameters', 'OK', '');

        this.showPopupParameters = false;
        // const t = DashboardHeaderComponent.t;
        // t.checkRequests(true);
      } else {
        // alert('Save parameters: Error');
        this.errorMsg.showErrorMessage('Save parameters', 'Error', 'Error');
      }
  }, error => {
      console.warn(error);
      alert(error);
      this.errorMsg.showErrorMessage('Save parameters', error, 'Error');
    });
  }

  public get animate(): any {
    return {
      type: 'zoom',
      direction: 'down',
      duration: 300
    };
  }

  public getBackColorReqPar() {
    if (this.lastColor === '#FFF') {
      this.lastColor = '#f5f5f5';
    } else {
      this.lastColor = '#FFF';
    }
    return this.lastColor;
  }

  getValueEdit(colKey, val, type) {
    return type;
  }

  getValue(colKey, val, type) {
    if (colKey === 'Delta' && this.selectedElement) {
      const baseValue = this.selectedElement['Delta'];
      const delta = Math.round((val - baseValue) * 1000) / 1000;
      return delta;
    }

    if (val === 'null' || !val || val === 'undefined' || val === undefined || val === undefined) {
      if (this.maskName === 'tc-run-detail') {
        return '-';
      } else {
        if (this.maskName === 'report') {
          // if (val !== undefined) {
          //   return '0';
          // }
        } else {
          return '';
        }
      }
    } else {
      if (type === 'date') {
        if (val) {
          // while (val.indexOf('-') > -1) {
          //  val = val.replace('-', '/');
          // }
          val = moment(new Date(val)).format('YYYY-MM-DD HH:mm:ss');
        }
      } else {
        val = val + '';
        const n = val.indexOf('&');
        if (n > -1) {
          val = val.substring(0, n);
        }
      }
    }

    // val = '<span style="color: #a00;">' + val + '</span>';


    return val;
  }

  getCellStyle(d, val) {
    const bgColor = this.getBGColorRow(d);
    const fgColor = this.getFGColor(d);

    if (bgColor !== '' && fgColor !== '') {
      let r = '{ "background-color": "' + bgColor + '", ';
      r += '"color": "' + fgColor + '" }';
      const object = JSON.parse( r );
      return object;
    } else {
      if (val === 'null' || !val || val === 'undefined' || val === undefined || val === undefined) {
        return '';
      } else {
        val = val + '';
        const n = val.indexOf('&');
        const l: number = val.length;
        if (n > -1) {
          const v = val.substring(n + 1, l);
          const isNumber = isNumeric(v);
          if (isNumber) {
            val = '{' + val.substring(n + 1, l) + '}';
            while (val.indexOf('\'') > -1) {
              val = val.replace('\'', '"');
            }
            const object = JSON.parse( val );
            return object;
          } else {
            return '';
          }
        }
      }
    }
  }

  editHandler() {
    if (this.lastSelected !== null) {
      DashboardComponent.t = this;
      this.editClicked.emit(this.lastSelected || null);
    }

    this.clickOnMenu1 = false;
  }

  removeHandler() {
    const ll = DashboardHeaderComponent.t;
    // if (this.lastSelected) {
       // this.delClicked.emit(this.lastSelected || null);
    // }
    if (this.maskName === 'tc-scenario' || this.maskName === 'ad-hoc') {
      if (this.lastSelected.dataItem.TS_ID) {
        if (confirm('Are you sure to delete TS ' + this.lastSelected.dataItem.TS_ID)) {
          this.setTimerForRefresh();

          idPerQuery = this.lastSelected.dataItem.TS_ID;

          this.apiService.postDeleteTS(idPerQuery, this.sessionService.getToken())
            .map(response => response.json())
            .subscribe(result => {
              this.writeLog('Delete', result);
            },
            error => {
              // this.logColor = '#ba371a';
              // this.logText = 'Error: ' + error.statusText;
              const msg = 'Error: ' + error.statusText;
              ll.writeLogText(msg, '#ba371a', msg);
            }); ;
           }
      }
    }

    this.clickOnMenu1 = false;
  }

  addHandler() {
    this.addClicked.emit(this.dataAdd || null);

    this.clickOnMenu1 = false;
  }

  detailHandler() {
    if (this.maskName === 'tc-run-list_scheduler' || this.maskName === 'tc-run-list_adHocTCRun') {
      this.tcRunModalService.modalShow({'modal': 'tcDetail', 'action': 'open', 'tcRunId': this.lastSelected.dataItem});
    } else {
      if (this.maskName === 'adhoc-list-scenario') {
        this.tcRunModalService.modalShow({'modal': 'tsDetail', 'action': 'open', 'ts': this.lastSelected.dataItem.TS_RUN_ID});
      } else {
        if (this.maskName === 'tc-run-list_report') {
          this.lastSelected.dataItem.TC_RUN_ID = this.lastSelected.dataItem.ID;
          this.tcRunModalService.modalShow({'modal': 'tcDetail', 'action': 'open', 'tcRunId': this.lastSelected.dataItem});
        }
      }
    }

    this.clickOnMenu1 = false;
  }

  copyScenario() {
    if (this.maskName === 'tc-scenario' || this.maskName === 'ad-hoc') {
      // this.editClicked.emit(this.lastSelected || null);
      this.tcRunModalService.modalShow({'modal': 'tsEditor', 'action': 'copy', 'data': this.lastSelected});
    }

    this.clickOnMenu1 = false;
  }

  runScenario() {
    const ll = DashboardHeaderComponent.t;
    if (this.maskName === 'tc-scenario' || this.maskName === 'ad-hoc') {
      if (this.lastSelected.dataItem.TS_ID) {
        this.setTimerForRefresh();

        idPerQuery = this.lastSelected.dataItem.TS_ID;

        this.apiService.postRunScenario(idPerQuery, this.sessionService.getToken())
          .map(response => response.json())
          .subscribe(result => {
            // howManyDays = 0;

            this.writeLog('Run', result);
          },
          error => {
            // alert('Error');
            // this.logColor = '#ba371a';
            // this.logText = 'Error: ' + error.statusText;
            const msg = 'Error: ' + error.statusText;
            ll.writeLogText(msg, '#ba371a', msg);
          }); ;
      }
    }
    if (this.maskName === 'tc-run-list_adHocTCRun') {
      if (this.lastSelected.dataItem.TC_RUN_ID) {
        idPerQuery = this.lastSelected.dataItem.TC_RUN_ID;
        const status = this.lastSelected.dataItem.STATUS;
        if (status === 'WaitingUserStart') {
          this.apiService.TcRunStartFromWaitingUser(idPerQuery, this.sessionService.getToken())
            .map(response => response.json())
            .subscribe(result => {
              this.writeLog('Run', true);
            },
            error => {
              // alert('Error');
              // this.logColor = '#ba371a';
              // this.logText = 'Error: ' + error.statusText;
              const msg = 'Error: ' + error.statusText;
              ll.writeLogText(msg, '#ba371a', msg);
            }); ;
        } else {
          this.apiService.TcRunRestartSrv(idPerQuery, this.sessionService.getToken())
            .map(response => response.json())
            .subscribe(result => {
              this.writeLog('Run', true);
            },
            error => {
              // alert('Error');
              // this.logColor = '#ba371a';
              // this.logText = 'Error: ' + error.statusText;
              const msg = 'Error: ' + error.statusText;
              ll.writeLogText(msg, '#ba371a', msg);
            }); ;
        }
      }
    }

    this.clickOnMenu1 = false;
  }

  writeLog(operation, result) {
    const ll = DashboardHeaderComponent.t;
    const d: Date = new Date();
    const h = d.getHours().toString();
    let hh: String = '';
    if (h.length === 1) { hh = '0' + h; } else { hh = h; }
    const  m = d.getMinutes().toString();
    let mm: String = '';
    if (m.length === 1) { mm = '0' + m; } else { mm = m; }
    const  s =  d.getSeconds().toString();
    let ss: String = '';
    if (s.length === 1) { ss = '0' + s; } else { ss = s; }
    const sd = hh + ':' + mm + ':' + ss;
    // const sd = mm + ':' + ss;
    if (result === true) {
      // this.logColor = '#00c81d';
      // this.logText = sd + ' ' + operation + ': [Ok]';
      const msg = sd + ' ' + operation + ': [Ok]';
      ll.writeLogText(msg, '#00c81d', msg);

      // this.setTimerForRefresh();
    } else {
      let msg = '';
      if (result.RESULT) {
        const r = result.RESULT[0].message.toUpperCase();
        if (r === 'OK') {
          msg = sd + ' ' + operation + ' ' + result + ': [Ok]';

          // this.tooltipLogText = msg;
          const tt = msg;
          if (msg.length > 40) {
            msg = msg.substring(0, 37) + '...';
          }

          // this.reloadGrid();
          // this.logColor = '#00c81d';
          // this.logText = msg;
          ll.writeLogText(msg, '#00c81d', tt);


          // this.setTimerForRefresh();
        } else {
          msg = sd + ' ' + operation + ' ' + result + ': [Failed]';

          // this.tooltipLogText = msg;
          const tt = msg;
          if (msg.length > 40) {
            msg = msg.substring(0, 37) + '...';
          }

          // this.logColor = '#ba371a';
          // this.logText = msg;
          ll.writeLogText(msg, '#ba371a', tt);
        }
      } else {
        if (result === idPerQuery.toString()) {
          msg = sd + ' ' + operation + ' ' + result + ': [Ok]';

          // this.logColor = '#00c81d';
          // this.logText = msg;
          ll.writeLogText(msg, '#00c81d', msg);

          // this.setTimerForRefresh();
        } else {
          msg = sd + ' ' + operation + ' ' + result + ': [Failed]';

          // this.logColor = '#ba371a';
          // this.logText = msg;
          ll.writeLogText(msg, '#ba371a', msg);
        }

        // this.tooltipLogText = msg;
        const tt = msg;
        if (msg.length > 40) {
          msg = msg.substring(0, 37) + '...';
        }
      }
    }
  }

  pauseScenario() {
    const ll = DashboardHeaderComponent.t;
    if (this.maskName === 'tc-scenario' || this.maskName === 'ad-hoc') {
      if (this.lastSelected.dataItem.TS_ID) {
        this.setTimerForRefresh();

        idPerQuery = this.lastSelected.dataItem.TS_ID;

        let paused = true;
        if (this.lastSelected.dataItem.IS_PAUSED === 'Y') {
          paused = false;
        }
        this.apiService.postPauseScenario(idPerQuery, paused, this.sessionService.getToken())
          .map(response => response.json())
          .subscribe(result => {
            if (paused) {
              this.writeLog('Paused', result);
            } else {
              this.writeLog('Resumed', result);
            }
          },
          error => {
            // this.logColor = '#ba371a';
            // this.logText = 'Error: ' + error.statusText;
            const msg = 'Error: ' + error.statusText;
            ll.writeLogText(msg, '#ba371a', msg);
          }); ;
      }
    }
    if (this.maskName === 'ad-hoc') {
    }

    this.clickOnMenu1 = false;
  }

  stopTc() {
    if (this.maskName === 'tc-run-list_scheduler' || this.maskName === 'tc-run-list_adHocTCRun') {
      if (this.lastSelected.dataItem.TC_RUN_ID) {
        const ll = DashboardHeaderComponent.t;
        idPerQuery = this.lastSelected.dataItem.TC_RUN_ID;

        this.apiService.postStopTcRun(idPerQuery, this.sessionService.getToken())
          .map(response => response.json())
          .subscribe(result => {
            this.writeLog('Stop', result);
          },
          error => {
            // this.logColor = '#ba371a';
            // this.logText = 'Error: ' + error.statusText;
            const msg = 'Error: ' + error.statusText;
            ll.writeLogText(msg, '#ba371a', msg);
          }); ;
      }
    }

    this.clickOnMenu1 = false;
  }

  showInfos() {
    // this.reportMode = '';
    if (this.showPopup) {
      this.showPopup = false;
    } else {
      if (this.lastSelected) {
        let s = '';
        this.fieldNames.forEach(element => {
          if (element !== 'TRAILIS' && element !== 'TRAILIS_DAY' ) {
              // s += '<bold>' + element + ':</bold> ' + this.lastSelected.dataItem[element] + '<br />';
              s += element.toUpperCase() + ': ' + this.lastSelected.dataItem[element] + '\n';
          }
        });

        this.textInfo = s;
        this.showPopup = true;
      }
    }

    this.clickOnMenu1 = false;
  }

  public reloadGrid() {
    // const t = DashboardHeaderComponent.t;

    // localStorage.setItem(t.returnUserName() + '_' + this.maskName + '_persistence', '0');

    // this.itemSelected.emit(this.selectedElement || null);

    // if (this.maskName === 'tc-run-list_adHocTCRun') {
      // const t = DashboardHeaderComponent.t;
      // t.checkRequests(false);
    // }

    // if (this.maskName === 'Requests') {
      // const t = DashboardHeaderComponent.t;
      // t.checkRequests(true);
    // } else {
      /* if (this.maskName === 'tc-run-list_scheduler' || this.maskName === 'tc-run-list_adHocTCRun') {
        daysAgo = this.numberOfDays;
      } else {
        daysAgo = -1;
      } */

      // const t = DashboardHeaderComponent.t;
      // t.checkRequests(false);

      // this.lastSelected = null;

      if (this.editOn && AntsGridComponent.rowsModified) {
        if (confirm('Are you sure to discard changes ?')) {
          AntsGridComponent.rowsModified = false;
          this.gridGeneral.reloadGrid(this.maskName, null);
        }
      } else {
        this.gridGeneral.reloadGrid(this.maskName, null);
      }
    // }

    this.clickOnMenu2 = false;
  }

  getBGColorRow(r) {
    let bgColor = '';

    if (this.gridData && r.BackColor !== undefined) {
        bgColor = r.BackColor;
    }

    return bgColor;
  }

  // getLogColor() {
  //   return this.logColor;
  // }

  /* getBGColor(r) {
    let bgColor = '';

    if (this.gridData) {
        bgColor = r.BackColor;
    }

    return bgColor;
  } */

  getFGColor(r) {
    let fgColor = '';

    if (this.gridData && r.ForeColor !== undefined) {
        fgColor = r.ForeColor;
   }

    return fgColor;
  }

  getPadding() {
    let padding = '2';

    if (this.maskName === 'tc-run-detail') {
      padding = '0';
    }

    return padding;
  }

  /* getRowColor(rowIndex) {
    const style = {'background-color': null, 'color': null};

    this.paddingCell = '2';
    if (this.gridData) {
      if (this.gridData[rowIndex].BackColor) {
        // style['background-color'] = this.gridData[rowIndex].BackColor;
        this.bgColorCell = this.gridData[rowIndex].BackColor;
      }
      if (this.gridData[rowIndex].ForeColor) {
        // style['color'] = this.gridData[rowIndex].ForeColor;
        this.fgColorCell = this.gridData[rowIndex].ForeColor;
      }
    }

    if (this.maskName === 'tc-scenario') {
      this.paddingCell = '0';
    }
    return style;
  } */

  getIconTrace(column) {
    if (column.Protocol === 'L3') {
      return 'k-icon k-i-star';
    } else {
      return 'k-icon k-i-stop';
    }
  }

  isIcon(column, columnIcon) {
    let s: string;
    let iconPath = '';
    let iconName = '';

    // const column = this.data.ColumnProperty.find(col =>
    //   col.key.replace('<' , '').replace('>' , '').replace('.' , ' ').replace('.' , ' ')
    //   ===
    //   columnKey);
    if (column) {
      if (columnIcon) {
        switch (columnIcon) {
          case 'ICONS':
            iconPath = 'assets/img/icons/';
            iconName = column.key;
            s = iconPath;
            this.spanIcon = '';
            break;
          case 'FLAGS':
            iconPath = 'assets/img/flags/';
            iconName = column.key;
            s = iconPath;
            this.spanIcon = '';
            break;
          case 'ICON_TRACE':
            iconPath = '';
            s = 'ICON_TRACE';
            this.spanIcon = 'k-i-star';
            break;
        }

        return s;
      } else {
        s = '';
        return s;
      }
    } else {
      // alert(columnKey);
    }
    s = '';
    return s;
  }

  getIconString(c, s) {
    if (c.toUpperCase().indexOf('FLAGS') > -1) {
      let ss = s;
      ss = ss.replace('PORT ' , '');
      if (ss.indexOf('-') > -1) {
        ss = ss.substring(0, ss.indexOf('-'));
      }

      return ss;
    } else {
      return s;
    }
  }

  renderGraph(key) {
  }

  convertStringToArrayNumber(c: string) {
    const c2 = c.split(',');
    const n = new Array<number>();
    c2.forEach(element => {
      n.push(Number(element));
    });

    return n;
  }

  /* getsOK(r) {
    return this.sOK[r];
  }

  getsFAILED(r) {
    return this.sFAILED[r];
  }

  getsABORT(r) {
    return this.sABORT[r];
  }

  getsDIFFERENCE(r) {
    return this.sDIFFERENCE[r];
  } */

  getOk(data, r) {
    if (this.sOK[r] === undefined) {
      this.sOK.push([]);

      if (data && data.indexOf('|') > -1 && data.indexOf(',') > -1) {
        const c = data.split('|');

        // const d1 = this.convertStringToArrayNumber(c[1]);
        this.sOK[r] = this.convertStringToArrayNumber(c[1]);

        // return  d1;
      }
    // } else {
    //   const d1 = this.convertStringToArrayNumber(this.sOK[r]);

    //  return  d1;
    }
  }

  getOk_Day(data, r) {
    if (this.sOK_DAY[r] === undefined) {
      this.sOK_DAY.push([]);

      if (data && data.indexOf('|') > -1) {
        const c = data.split('|');

        // const d1 = this.convertStringToArrayNumber(c[1]);
        this.sOK_DAY[r] = this.convertStringToArrayNumber(c[1]);

        // return  d1;
      }
    // } else {
    //   const d1 = this.convertStringToArrayNumber(this.sOK[r]);

    //  return  d1;
    }
  }

  getFailed(data, r) {
    if (this.sFAILED[r] === undefined) {
      this.sFAILED.push([]);

      if (data && data.indexOf('|') > -1 && data.indexOf(',') > -1) {
        const c = data.split('|');

        // const d1 = this.convertStringToArrayNumber(c[2]);
        this.sFAILED[r] = this.convertStringToArrayNumber(c[2]);

        // return  d1;
      }
    // } else {
    //   const d1 = this.convertStringToArrayNumber(this.sFAILED[r]);

    //   return  d1;
    }
  }

  getFailed_Day(data, r) {
    if (this.sFAILED_DAY[r] === undefined) {
      this.sFAILED_DAY.push([]);

      if (data && data.indexOf('|') > -1) {
        const c = data.split('|');

        // const d1 = this.convertStringToArrayNumber(c[2]);
        this.sFAILED_DAY[r] = this.convertStringToArrayNumber(c[2]);

        // return  d1;
      }
    // } else {
    //   const d1 = this.convertStringToArrayNumber(this.sFAILED[r]);

    //   return  d1;
    }
  }

  getAbort(data, r) {
    if (this.sABORT[r] === undefined) {
      this.sABORT.push([]);

      if (data && data.indexOf('|') > -1 && data.indexOf(',') > -1) {
        const c = data.split('|');

        // const d1 = this.convertStringToArrayNumber(c[3]);
        this.sABORT[r] = this.convertStringToArrayNumber(c[3]);

        // return  d1;
      }
    // } else {
    //   const d1 = this.convertStringToArrayNumber(this.sABORT[r]);

    //   return  d1;
    }
  }

  getAbort_Day(data, r) {
    if (this.sABORT_DAY[r] === undefined) {
      this.sABORT_DAY.push([]);

      if (data && data.indexOf('|') > -1) {
        const c = data.split('|');

        // const d1 = this.convertStringToArrayNumber(c[3]);
        this.sABORT_DAY[r] = this.convertStringToArrayNumber(c[3]);

        // return  d1;
      }
    // } else {
    //   const d1 = this.convertStringToArrayNumber(this.sABORT[r]);

    //   return  d1;
    }
  }

  getOther_Day(data, r) {
    if (this.sOTHER_DAY[r] === undefined) {
      this.sOTHER_DAY.push([]);

      if (data && data.indexOf('|') > -1) {
        const c = data.split('|');

        // const d1 = this.convertStringToArrayNumber(c[3]);
        this.sOTHER_DAY[r] = this.convertStringToArrayNumber(c[4]);

        // return  d1;
      }
    // } else {
    //   const d1 = this.convertStringToArrayNumber(this.sABORT[r]);

    //   return  d1;
    }
  }

  /* getDifference(data, r) {
    if (this.sDIFFERENCE[r] === undefined) {
      this.sDIFFERENCE.push([]);

      if (data && data.indexOf('|') > -1 && data.indexOf(',') > -1) {
        const c = data.split('|');

        // let max = [0, 0, 0, 0, 0, 0, 0];
        // let maxB = 0;
        // let maxC = 0;

        const d0 = this.convertStringToArrayNumber(c[0]);
        const d1 = this.convertStringToArrayNumber(c[1]);
        const d2 = this.convertStringToArrayNumber(c[2]);
        const d3 = this.convertStringToArrayNumber(c[3]);

        let maxT =  0;
        let index = 0;
        d1.forEach(element => {
          const t = d1[index] + d2[index] + d3[index];
          if (t > maxT) {
            maxT = t;
          }
          index++;
        });
        /* d2.forEach(element => {
          if (element > maxB) {
            maxB = element;
          }
        });
        d3.forEach(element => {
          if (element > maxC) {
            maxC = element;
          }
        });

        max.forEach(element => {
          if (element > maxT) {
            maxT = element;
          }
        }); *//*

        // let maxT = maxA + maxB + maxC;
        if (maxT === 0) {
          maxT = 1;
        }
        const dd = [0, 0, 0, 0, 0, 0, 0];

        // let index = 0;
        // this.sDIFFERENCE[r] = '';
        index = 0;
        d0.forEach(element => {
          dd[index] = maxT - (d1[index] + d2[index] + d3[index]);
          index++;
        });

        this.sDIFFERENCE[r] = dd;

        // console.log('Riga ' + r + ' -> ' + dd + ' T.: ' + maxT + ')');
        // console.log('   -> ' + d1 + ' - ' + d2 + ' - ' + d3);
        // this.sDIFFERENCE[r] = this.sDIFFERENCE[r].substring(0, this.sDIFFERENCE[r].length - 1);

        // return dd;
      }
    // } else {
    //   const d1 = this.convertStringToArrayNumber(this.sDIFFERENCE[r]);

    //   return  d1;
    }
  } */

  getCount() {
    return [0, 1, 2, 3, 4, 5, 6, 7];
  }

  public excelData = () => {
    const datas = this.gridData;
    let datasToPrint1 = '';

    datas.forEach(element => {
      let testo = JSON.stringify(element);
      if (testo && testo.indexOf('&') > -1) {
        do {
          let t = testo.indexOf('&');
          let tt = testo.substring(t, testo.length);
          t = tt.indexOf(',');
          tt = tt.substring(0, t - 1);
          testo = testo.replace(tt, '');
        }
        while (testo.indexOf('&') > -1);

        datasToPrint1 += (testo + ',');
      } else {
        datasToPrint1 += (testo + ',');
      }
    });
    if (!datasToPrint1) {
      datasToPrint1 = JSON.stringify(datas) + ' ';
    }

    datasToPrint1 = '[' + datasToPrint1.substring(0, datasToPrint1.length - 1);
    datasToPrint1 += ']';

    const datasToPrint2 = JSON.parse(datasToPrint1);

    this.clickOnMenu2 = false;

    return process(datasToPrint2, {});
  }

  pdfPrint() {
    this.clickOnMenu2 = false;
  }
}
