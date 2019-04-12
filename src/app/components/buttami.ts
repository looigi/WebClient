import { Component } from '@angular/core';
import { buttamiValori } from './buttamiValori';

@Component({
  selector: 'buttami-component',
  template: `
    <kendo-grid [data]="gridData" [height]="410">
      <kendo-grid-column field="ID" title="1" width="140"></kendo-grid-column>
      <kendo-grid-column field="TD_SCHED_ID" title="2" width="140"></kendo-grid-column>
      <kendo-grid-column field="SCHED_VERS" title="3" width="140"></kendo-grid-column>
      <kendo-grid-column field="EXEC_DATE" title="4" width="140"></kendo-grid-column>
      <kendo-grid-column field="REPORT_URL" title="5" width="140"></kendo-grid-column>
      <kendo-grid-column field="STATUS" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="DELETE_FLAG" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="END_DATE" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="NUM_TOTAL" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="NUM_NOT_FEASIBLE" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="NUM_FAILED" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="NUM_ABORTED" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="NUM_OK" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="OPERATOR_EXEC" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="NUM_STOPPED" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="TD_RUN_ID" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="TP_NAME" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="TRACE_URL" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="TD_TP_ID" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="RETRY_NUM" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="START_DATE" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="STATUS_DESCR" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="EXEC_DIRECTIVE_FLAGS" title="****" width="140"> </kendo-grid-column>
      <kendo-grid-column field="DATE_UPD_STATUS" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="TC_RUN_ID_FATHER" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="VERSION" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="TD_NAME" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="EXEC_MODE" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="FREQ_BASE" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="TOT_ITERATIONS" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="SCHED_ITERATIONS" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="EXECUTED_ITERATIONS" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="IS_PAUSED" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="LATEST_SCHED_DATE" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="LATEST_TD_RUN_ID" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="OPERATOR" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="PRIORITY" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="NAME" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="DESCRIPTION" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="GROUP_NAME" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="IS_PUBLIC" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="STATUS_DESCRIPTION" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="WEEK_CALENDAR" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="UPDATE_TIMESTAMP" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="CATEGORY" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="CODE" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="CODE_MNEMONIC" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="VALUE_STR" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="TD_TYPE" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="EXEC_INTERVAL" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="IS_DUMMY" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="DOC_TEMPLATE" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="PROTOCOL_LEVEL" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="SCRIPT_NAME" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="VERIFICATION_PROCESSING" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="IS_PREDEFINED" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="TP_DATE" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="SOURCE_INCLUDED" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="SERVICE_FAMILY" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="SERVICE" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="DOCUMENT" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="TIME_OFFSET" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="MAX_ATTEMPTS_DELAY" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="TC_NAME" title="****" width="140"></kendo-grid-column>
      <kendo-grid-column field="TC_ORDER" title="****" width="140"></kendo-grid-column>
    </kendo-grid>
  `
})
export class ButtamiComponent {
  public gridData: any[] = buttamiValori;
}
