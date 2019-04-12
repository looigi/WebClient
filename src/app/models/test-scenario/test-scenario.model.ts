import {TimeSchedule} from './time-schedule.model';
import {TsTab} from './ts-tab.model';

export class TestScenario {
  TsId;
  TsName;
  TdName;
  Description;
  IsPaused;
  Priority;
  IsPublic;
  TimeSchedule: TimeSchedule;
  TabColl: TsTab[];
  TcColl;
}
