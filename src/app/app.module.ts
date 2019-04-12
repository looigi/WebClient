// Amngular core modules
import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
// BrowserAnimationsModule imported under KENDO UI

// KENDO UI modules
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ButtonsModule} from '@progress/kendo-angular-buttons';
import {GridModule, PDFModule} from '@progress/kendo-angular-grid';
import {LayoutModule} from '@progress/kendo-angular-layout';
import {DropDownsModule} from '@progress/kendo-angular-dropdowns';
import {DateInputsModule} from '@progress/kendo-angular-dateinputs';
import {InputsModule} from '@progress/kendo-angular-inputs';
import {ChartModule} from '@progress/kendo-angular-charts';
import {SparklineModule} from '@progress/kendo-angular-charts';
import 'hammerjs';

// angular2 google maps module
import {AgmCoreModule, InfoWindowManager, GoogleMapsAPIWrapper, MarkerManager} from 'angular2-google-maps/core';

// angular2 bootstrap module
import {BsDropdownModule, ModalModule,
  TabsModule, TooltipModule, TypeaheadModule,
  CollapseModule} from 'ngx-bootstrap';

// custom components
import {SessionService} from './services/session.service';
import {AppComponent} from './app.component';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './components/dashboard/main/dashboard/dashboard.component';
import {LoginComponent} from './components/dashboard/login/login.component';
import {HttpClient} from './services/httpclient.service';
import { HttpClientModule } from '@angular/common/http';
import {ApiService} from './services/api.service';
import {ModalService} from './services/modal.service';
import {DashboardHeaderComponent} from './components/dashboard/main/header/header.component';
import {SchedulerComponent} from './components/dashboard/scheduler/scheduler.component';
import {TestScenarioComponent} from './components/dashboard/scheduler/test-scenario.component';
import {TSRunListComponent} from './components/dashboard/scheduler/ts-run-list.component';
import {TCRunListComponent} from './components/uc/tc_run_list/tc-run-list.component';
import {MapsResultComponent} from './components/dashboard/maps-component';
import {TsTreeComponent} from './components/dashboard/scheduler/ts-tree.component';
import {ReportTreeComponent} from './components/dashboard/report/report-tree.component';
import {ReportMainComponent} from './components/dashboard/report/report.component';
import {FilterTimeComponent} from './components/dashboard/filter-time.component';
import {ReportMapResultsComponent} from './components/dashboard/report/report-map-results.component';
import {AntsGridComponent} from './components/uc/ants-grid/ants-grid.component';
// import {AntsGridEditComponent} from './components/uc/ants-grid-edit/ants-grid-edit.component';
import {NeidControllerComponent} from './components/uc/edit-controllers/neid-controller/neid-controller.component';
import {SIMCategoryControllerComponent} from './components/uc/edit-controllers/simcategory-controller.component';
import {EditMaskTabComponent} from './components/uc/edit-controllers/edit-mask.tab.component';
import {FreetextEditComponent} from './components/uc/edit-controllers/freetext-controller.component';
import {LookupEditComponent} from './components/uc/edit-controllers/lookup-controller.component';
import {AddModalComponent} from './components/uc/edit-controllers/add-modal-component';
import {NumberEditComponent} from './components/uc/edit-controllers/number-controller.component';
import {MapTechnologyComponent} from './components/uc/edit-controllers/neid-controller/map-technology.component';
import {TechListComponent} from './components/uc/edit-controllers/neid-controller/tech-list.component';
import {TupleTechListComponent} from './components/uc/edit-controllers/neid-controller/tuple-tech-list.component';
import {TsEditorComponent} from './components/uc/edit-controllers/ts-editor.component';
import { WeekSchedulerComponent } from './components/uc/edit-controllers/week-scheduler/week-scheduler.component';
// TC Run Detail Info Components
import {TcRunDetailComponent} from './components/dashboard/tc-run-detail/tc-run-detail';
import {TcRunDetailPrmMsrComponent} from './components/dashboard/tc-run-detail/tc-run-detail-prm-msr';
import {TcRunDetailTraceTreeComponent} from './components/dashboard/tc-run-detail/tc-run-detail-trace-tree';
import {TcRunDetailTraceL3Component} from './components/dashboard/tc-run-detail/tc-run-detail-trace-l3';
import { TechnologyViewerComponent } from './components/dashboard/technology/technology-viewer.component';
import { TopologyComponent } from './components/dashboard/topology/topology.component';

import {EventLogMainComponent} from './components/dashboard/event-log/event-log';
import {EventLogTreeComponent} from './components/dashboard/event-log/eventlog-tree.component';
import {SimMainComponent} from './components/dashboard/sim-manager/sim-manager';
import {SimTreeComponent} from './components/dashboard/sim-manager/sim-tree.component';
import {ExcelModule } from '@progress/kendo-angular-grid';
import {SimpleTimer} from 'ng2-simple-timer';
import {ButtamiComponent} from './components/buttami';
import { PortMainComponent } from './components/dashboard/port-manager/port-manager';
import { PortTreeComponent } from './components/dashboard/port-manager/port-tree.component';
import { ChangePasswordComponent } from './components/dashboard/change-password/change-password.component';
import { ProfileComponent } from './components/dashboard/profile/profile.component';
import { GeneralGridComponent } from './components/uc/ants-grid/generalGrid.component';
import { PopupModule } from '@progress/kendo-angular-popup';

import { ClipboardModule } from 'ngx-clipboard';
import { AdHocComponent } from './components/dashboard/adhoc/adhoc.component';
import { AdHocTreeComponent } from './components/dashboard/adhoc/adhoc-tree.component';
import { AdHocContainerComponent } from './components/dashboard/adhoc/adhoc-container-component';
import { AdHocListScenarioComponent } from './components/dashboard/adhoc/adhoc-list-scenario.component';
import { TsDetailComponent } from './components/dashboard/ts-detail/ts-detail';
import { CookieService } from 'ngx-cookie-service';
import { DatePipe } from '../../node_modules/@angular/common';
import { PopupRequestsComponent } from './components/uc/popupRequests/popupRequests.component';
import { DialogComponent } from './components/uc/dialog-box/dialog-component';
import { AnalyticsComponent } from './components/dashboard/analytics/analytics';
import { EmptyPageComponent } from './components/dashboard/empty-page/empty-page';

// import data from './config/config.json';

const appRoutes: Routes = [
  {path: 'dashboard', redirectTo: 'dashboard/scheduler', pathMatch: 'full'},
  // {path: 'adhoc', redirectTo: 'dashboard/ad-hoc', pathMatch: 'full'},
  {
    path: 'dashboard/scheduler',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: DashboardHeaderComponent,
        outlet: 'header'
      },
      {
        path: '',
        component: SchedulerComponent,
        outlet: 'page'
      },
      {
        path: '',
        component: TsTreeComponent,
        outlet: 'menu'
      }
    ]
  },
  {
    path: 'dashboard/report',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: DashboardHeaderComponent,
        outlet: 'header'
      },
      {
        path: '',
        component: ReportMainComponent,
        outlet: 'page'
      },
      {
        path: '',
        component: ReportTreeComponent,
        outlet: 'menu'
      }
    ]

  },
  {
    path: 'dashboard/techtopoloy',
    component: TopologyComponent,
    children: [
      {
        path: '',
        component: DashboardHeaderComponent,
        outlet: 'header'
      },
      {
        path: '',
        component: TechnologyViewerComponent,
        outlet: 'page'
      },
    ]
  },
  {
    path: 'dashboard/event-log',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: DashboardHeaderComponent,
        outlet: 'header'
      },
      {
        path: '',
        component: EventLogMainComponent,
        outlet: 'page'
      } ,
      {
        path: '',
        component: EventLogTreeComponent,
        outlet: 'menu'
      }
    ]
  },
  {
    path: 'dashboard/sim-manager',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: DashboardHeaderComponent,
        outlet: 'header'
      },
      {
        path: '',
        component: SimMainComponent,
        outlet: 'page'
      } ,
      {
        path: '',
        component: SimTreeComponent,
        outlet: 'menu'
      }
    ]
  },
  {
    path: 'dashboard/port-manager',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: DashboardHeaderComponent,
        outlet: 'header'
      },
      {
        path: '',
        component: PortMainComponent,
        outlet: 'page'
      } ,
      {
        path: '',
        component: PortTreeComponent,
        outlet: 'menu'
      }
    ]
  },
  {
    path: 'dashboard/ad-hoc',
    component: DashboardComponent,
    children: [
      {
        path: '',
        component: DashboardHeaderComponent,
        outlet: 'header'
      },
      {
        path: '',
        component: AdHocContainerComponent,
        outlet: 'page'
      } ,
      {
        path: '',
        component: AdHocTreeComponent,
        outlet: 'menu'
      }
    ]
  },
  {
    path: 'dashboard/app-empty-page',
    component: EmptyPageComponent,
    children: [
      {
        path: '',
        component: DashboardHeaderComponent,
        outlet: 'header'
      },
      {
        path: '',
        component: EmptyPageComponent,
        outlet: 'page'
      }
    ]
  },
  {
    path: 'dashboard/app-analytics',
    component: AnalyticsComponent,
    children: [
      {
        path: '',
        component: DashboardHeaderComponent,
        outlet: 'header'
      },
      {
        path: '',
        component: AnalyticsComponent,
        outlet: 'page'
      }
    ]
  },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {path: '**', redirectTo: '/dashboard/scheduler', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent, DashboardComponent, LoginComponent, EmptyPageComponent,
    SchedulerComponent, DashboardHeaderComponent,
    TsTreeComponent, TestScenarioComponent,
    TSRunListComponent, TCRunListComponent,
    MapsResultComponent, ReportMainComponent, ReportTreeComponent, FilterTimeComponent,
    ReportMapResultsComponent, AntsGridComponent, // AntsGridEditComponent,
    TsEditorComponent,
    NeidControllerComponent, MapTechnologyComponent, TechListComponent, TupleTechListComponent,
    SIMCategoryControllerComponent,
    EditMaskTabComponent, FreetextEditComponent, LookupEditComponent,
    AddModalComponent, NumberEditComponent, WeekSchedulerComponent,
    TcRunDetailComponent, TcRunDetailPrmMsrComponent, TcRunDetailTraceTreeComponent, TcRunDetailTraceL3Component,
    EventLogMainComponent, EventLogTreeComponent, SimMainComponent, SimTreeComponent,
    TopologyComponent, TechnologyViewerComponent, PortMainComponent, PortTreeComponent
    , ProfileComponent, ChangePasswordComponent,
    AdHocContainerComponent, AdHocTreeComponent, AdHocComponent, AdHocListScenarioComponent,
    TsDetailComponent, PopupRequestsComponent,  DialogComponent, AnalyticsComponent,
    ButtamiComponent
  ],
  entryComponents: [ FreetextEditComponent, LookupEditComponent, NeidControllerComponent, AddModalComponent, NumberEditComponent ],
  imports: [
    BrowserModule,
    PopupModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule,
    PDFModule,
    HttpClientModule,

    // Kendo UI modules
    ButtonsModule,
    GridModule,
    ExcelModule,
    LayoutModule,
    InputsModule, DateInputsModule,
    DropDownsModule,
    ChartModule, SparklineModule,

    ClipboardModule,

    // angular-maps
    // AgmCoreModule.forRoot({
    //   apiKey: data.googleMapsApiKey
    // }),

    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCBwzkWID7D9NCPaoLLS13UxqqjmwLar7U'
    }),

    // ngx-bootstrap
    BsDropdownModule.forRoot(),
    ModalModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    TypeaheadModule.forRoot(),
    CollapseModule.forRoot()
  ],
  providers: [
    SessionService,
    HttpClient,
    ApiService,
    SimpleTimer,
    DatePipe,
    CookieService,
    GeneralGridComponent,
    ModalService],
  bootstrap: [AppComponent]
})

export class AppModule {

}
