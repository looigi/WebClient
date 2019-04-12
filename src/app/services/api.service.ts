import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient } from './httpclient.service';
import { SessionService } from './session.service';

@Injectable()

export class ApiService {
  private urlBase = environment.urlBase;
  // private urlRoot = environment.urlRoot;

  constructor(private httpclient: HttpClient, private sessionService: SessionService) {
  }

  login(params) {
    return this.httpclient.post(this.urlBase + '/Login', params);
  }

  logout(params = null) {
    return this.httpclient.get(this.urlBase + '/logout?sessionID=' + this.sessionService.getToken(), params);
  }

  getUserData(params = null) {
    return this.httpclient.get(this.urlBase + '/Operator/getOperator?operatorID=' +
    this.sessionService.getUser().username + '&sessionID=' + this.sessionService.getToken(), params);
  }

  getTestScenarios(filter = '', params = null) {
    // const wa_measure = ' (measr_name=\'Result\' or measr_name is null)';
    // filter = filter ? filter + ' AND' + wa_measure : wa_measure;
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_TD_SCHED_TRAILIS&sessionID=' +
    this.sessionService.getToken() + '&filter=' + filter , params);
  }

  getTSRun(filter = '', params = null) {
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_TS_RUN&sessionID=' +
    this.sessionService.getToken() + '&filter=' + filter, params);
  }

  getTCRun(filter = '', params = null) {
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_TC_RUN&sessionID=' +
    this.sessionService.getToken() + '&filter=' + filter, params);
  }

  getTSTree() {
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_TD_TREE&sessionID=' + this.sessionService.getToken());
  }

  getTSTreeAdHoc() {
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_TD_ADHOC_TREE&sessionID=' + this.sessionService.getToken());
  }

  getTSTree2() {
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_TD_TREE_2&sessionID=' + this.sessionService.getToken());
  }

  getReportTree() {
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_OLAP_TREE&sessionID=' + this.sessionService.getToken());
  }

  getReportResults(params = null) {
    return this.httpclient.get(this.urlBase + '/Olap/Aggr?sessionID=' + this.sessionService.getToken(), params);
  }

  getSiteList() {
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_SITE&sessionID=' + this.sessionService.getToken());
  }

  getPlmnTech() {
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_SITE_PLMN_TECH&sessionID=' + this.sessionService.getToken());
  }

  getSIMCategories() {
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_SIM_CATEGORY&sessionID=' + this.sessionService.getToken());
  }

  getTestScenarioObject(params = null) {
    return this.httpclient.get(this.urlBase + '/ts/tsWebGet?sessionID=' + this.sessionService.getToken(), params);
  }

  updateTestScenarioObject(testScenario) {
    console.log(this.urlBase + '/ts/tsWebUpdate');
    return this.httpclient.post(this.urlBase + '/ts/tsWebUpdate?sessionID=' + this.sessionService.getToken(), testScenario);
  }

  createTestScenarioObject(testScenario) {
    // console.log('createTestScenarioObject: ' + JSON.stringify(testScenario));
    return this.httpclient.post(this.urlBase + '/ts/tsWebCreate?sessionID=' + this.sessionService.getToken() + '&tsId=""', testScenario);
  }

  deleteTestScenarioObject(testScenario) {
    return this.httpclient.delete(this.urlBase + '/ts/tsWebDelete?sessionID=' + this.sessionService.getToken(), testScenario);
  }

  getLookUpDomainOptions(filter) {
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_PRM_DOMAIN&FILTER=' + filter + '&sessionID=' +
    this.sessionService.getToken());
  }

  getViewData(viewId, filter) {
    return this.httpclient.get(this.urlBase + '/view?viewId=' + viewId + '&sessionID=' +
      this.sessionService.getToken() + '&filter=' + filter);
  }

  getViewReport() {
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_TC_RUN_REQ&sessionID=' +
      this.sessionService.getToken());
  }

  getViewPolling() {
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_POLLING&sessionID=' +
      this.sessionService.getToken());
  }

  getViewReportWithFilter(f) {
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_TC_RUN_REQ&filter=Tc_Run_Id=' + f + '&sessionID=' +
      this.sessionService.getToken());
  }

  // LOOIGI 14/05/2018
  getEventLogTree() {
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_HIST_LOG_TREE&sessionID=' + this.sessionService.getToken());
  }
  // LOOIGI 14/05/2018

  // LOOIGI 17/05/2018
  getSimTree() {
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_SIM_TREE&sessionID=' + this.sessionService.getToken());
  }
  // LOOIGI 17/05/2018

  getPortTree() {
    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_PORT_TREE&sessionID=' + this.sessionService.getToken());
  }

  operatorSetPassword(params) {
    console.log(this.urlBase + '/Operator/setpassword');
    return this.httpclient.post(this.urlBase + '/Operator/setpassword', params);
  }

  getSqlSelect(sqlString) {
    return this.httpclient.get(this.urlBase + '/SqlSelect?sqlString=' + sqlString + '&sessionID=' + this.sessionService.getToken() );
  }

  getHeaderInfo() {
    let filter: string;
    let sessionID: string;

    filter = this.sessionService.user.value.username ;
    sessionID = this.sessionService.getToken() ;

    return this.httpclient.get(this.urlBase + '/view?viewId=VIEW_HEADER_INFO&sessionID=' + sessionID + '&filter=' + filter);
  }

  postRunScenario(tsId, sessionId) {
    return this.httpclient.post(this.urlBase + '/ts/run/create/' + tsId + '/' +  sessionId, null);
    // return this.httpclient.post(this.urlBase + '/ts/run/create', params);
  }

  TcRunStartFromWaitingUser(tsId, sessionId) {
    let s = '';
    s += '{';
    s += '  "tcRunId": "' + tsId + '",';
    s += '  "sessionID": "' + sessionId + '"';
    s += '}';
    const ss = JSON.parse(s);
    return this.httpclient.post(this.urlBase + '/Tc/startFromWaitingUser', ss);
  }

  TcRunRestartSrv(tsId, sessionId) {
    let s = '';
    s += '{';
    s += '  "tcRunId": "' + tsId + '",';
    s += '  "sessionID": "' + sessionId + '"';
    s += '}';
    const ss = JSON.parse(s);
    return this.httpclient.post(this.urlBase + '/TcRun/TcRunRestartSrv', ss);
  }

  postStopTcRun(tcId, sessionId) {
    let s = '';
    s += '{';
    s += '  "tcRunId": "' + tcId + '",';
    s += '  "sessionID": "' + sessionId + '"';
    s += '}';
    const ss = JSON.parse(s);
    return this.httpclient.post(this.urlBase + '/Tc/stop', ss);
  }

  postDeleteTS(tsId, sessionId) {
    // let s = '';
    // s += '{';
    // s += '  "tsIdList": "' + tsId + '",';
    // s += '  "sessionID": "' + sessionId + '"';
    // s += '}';
    // const ss = JSON.parse(s);
    // return this.httpclient.post(this.urlBase + '/ts/tsWebDelete/' + tsId + '/' +  sessionId, null);
    // return this.httpclient.delete(this.urlBase + '/ts/tsWebDelete', ss);
    return this.httpclient.delete(this.urlBase + '/ts/tsWebDelete?tsIdList=' + tsId + '&sessionId=' + sessionId, null);
  }

  postPauseScenario(tsId, pause, sessionId) {
    return this.httpclient.post(this.urlBase + '/ts/pause/' + tsId + '/' +  pause + '/' + sessionId, null);
    // return this.httpclient.post(this.urlBase + '/ts/run/create', params);
  }

  getTcRunTraceTreeGet(tcRunId) {
    return this.httpclient.get(this.urlBase + '/tc/TcRunTraceTreeGet?TcRunId=' + tcRunId + '&sessionID=' +
      this.sessionService.getToken());
  }

  getTcRunTraceL3Get(tcRunId) {
    return this.httpclient.get(this.urlBase + '/tc/TcRunTraceL3Get?TcRunId=' + tcRunId + '&sessionID=' +
      this.sessionService.getToken());
  }

  getTsFiles(ts) {
    return this.httpclient.get(this.urlBase + '/ts/run/TsRunFileListGet?TsRunId=' + ts + '&sessionID=' +
      this.sessionService.getToken());
  }

  getReport(s) {
    return this.httpclient.get(this.urlBase + '/Olap/Aggr?sessionID=' +
      this.sessionService.getToken() + s);
  }

  getOlapTsRunList(s) {
    s = JSON.parse(s);
    return this.httpclient.post(this.urlBase + '/Olap/TcRun', s);
  }

  getRequestParameters(s) {
    return this.httpclient.get(this.urlBase + '/TcRun/TcRunReqGetParameter?' + s + '&sessionID=' +
      this.sessionService.getToken());
  }

  setRequestParameters(t, ss) {
    return this.httpclient.post(this.urlBase + '/TcRun/TcRunReqSetParameter?TcRunId=' + t + '&sessionID=' +
      this.sessionService.getToken(), ss);

    // return this.httpclient.get(this.urlRoot + 'TcRun/TcRunReqSetParameter?' + s + '&sessionID=' +
    //   this.sessionService.getToken());
  }

  getCommitData(viewId, datas) {
    let s = '';
    let d = JSON.stringify(datas);
    while (d.indexOf('\\') > -1) {
      d = d.replace('\\', '');
    }
    d = d.substring(0, d.length - 1);
    d = d.substring(1, d.length);
    while (d.indexOf('"') > -1) {
      d = d.replace('"', '\'');
    }
    s += '{';
    s += '  "viewId": "' + viewId + '",';
    s += '  "sessionID": "' + this.sessionService.getToken() + '", ';
    s += '  "datasetEdit": "' + d + '"';
    s += '}';
    const ss = JSON.parse(s);

    return this.httpclient.post(this.urlBase + '/CommitData', ss );
  }
}

