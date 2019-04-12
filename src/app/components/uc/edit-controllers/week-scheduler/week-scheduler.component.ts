import { Component, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { noUndefined } from '@angular/compiler/src/util';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';


class TimeSched {
  time: string;
  step = 0;
}

class DaySchedule {
  day: number;
  sched: TimeSched[] = [];
}


class TimeDaySchedule {
  day: number;
  sched: TimeSched;
}

@Component({
  selector: 'week-scheduler',
  styleUrls: ['week-scheduler.css'],
  templateUrl: 'week-scheduler.html'
})

export class WeekSchedulerComponent implements OnInit {
  daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  modalRef: BsModalRef;
  private dayToSched;

  @Input() weekSched;
  @Output() weekSchedChanged: EventEmitter<any> = new EventEmitter<any>();

  private _schedTimeLine: TimeDaySchedule[] = [];
   weekDaySched: DaySchedule[] = [];

   constructor(private modalService: BsModalService) {}

   ngOnInit() {
     this.setScheduler(this.weekSched);
     console.log('Timeline', this._schedTimeLine);
     console.log('Week Sched', this.weekDaySched);
     console.log('StringTimeLine', this.schedToString());
   }

  private setScheduler(schedStr: string) {
    this.daysOfWeek.forEach((d, i) => this.weekDaySched.push(<DaySchedule>{day: i + 1, sched: []}));

    if (!schedStr) { return; }
    const schedArray = schedStr.split('|');
    schedArray.forEach(s => {
      const singleSched = this.parseTimeDaySchedule(s.trim());
      if (singleSched) { this._schedTimeLine.push(singleSched); }
    });
    this.timelineSort();
    this.setDaySched();
  }


  private timelineSort() {
    this._schedTimeLine.sort((s1, s2) => {
      if (Date.parse('2000-01-01T' + s1.sched.time) < Date.parse('2000-01-01T' + s2.sched.time)) { return -1; }
      if (Date.parse('2000-01-01T' + s1.sched.time) > Date.parse('2000-01-01T' + s2.sched.time)) { return 1; }
      return 0;
    });
    let step = 0;
    let pre = this._schedTimeLine[0].sched.time;
    this._schedTimeLine.forEach(s => {
      if (Date.parse('2000-01-01T' + s.sched.time) > Date.parse('2000-01-01T' + pre)) { step++; }
      s.sched.step = step;
      pre = s.sched.time;
    });
  }


  private setDaySched() {
    for (let i = 0; i < 7; i++) {
      const daySchedT =  this._schedTimeLine.filter(d => d.day === i + 1);
      this.weekDaySched[i] = {
        day: i + 1,
        sched: daySchedT.map(s => s.sched)
      };
    }
  }


  private parseTimeDaySchedule(value: string) {
    const regExDaySched = /[1-7][\s]([01]?[0-9]|2[0-3])[0-5][0-9]$/g;
    if (regExDaySched.test(value.toString())) {
      return <TimeDaySchedule>{
        day: Number(value.charAt(0)),
        sched: <TimeSched>{
          time: value.slice(2).slice(0, 2) + ':' + value.slice(2).slice(2),
          step: 0
        }
      };
    } else { return null; }
  }


  addSchedToDay(day, time) {
    if (!time || this._schedTimeLine.findIndex(s => s.day === day + 1 && s.sched.time === time) > -1) { return; }
    this._schedTimeLine.push(
      <TimeDaySchedule>{
        day: day + 1,
        sched: {
          time: time.toString(),
          step: 0
        }
      }
    );
    this.timelineSort();
    this.setDaySched();
    this.weekSchedChanged.emit(this.schedToString());
  }


  delSchedToDay(day, time) {
     // console.log('Day', day, this.weekDaySched[day - 1].sched.findIndex(s => s.time === time));
     // this.weekDaySched[day - 1].sched.splice(this.weekDaySched[day - 1].sched.findIndex(s => s.time === time), 1);
    const delIndex = this._schedTimeLine.findIndex(s => s.day === day && s.sched.time === time);
     this._schedTimeLine.splice(delIndex, 1);
     for (let i = delIndex; i < this._schedTimeLine.length; i++) {
       this._schedTimeLine[i].sched.step--;
     }
     this.setDaySched();
     this.weekSchedChanged.emit(this.schedToString());
  }


  dayHasSched(daySched: DaySchedule) {
    return (this._schedTimeLine && daySched && daySched.sched.length > 0) ? true : false;
  }

  schedToString() {
    let result = '';
    this._schedTimeLine.forEach(s => {
      if (s.day) { result = result + s.day + ' ' + s.sched.time.replace(/:/g, '') + '|'; }
    });
    if (result.endsWith('|')) { result = result.slice(0, -1); }
    console.log('Timeline', this._schedTimeLine);
    console.log('Week Sched', this.weekDaySched);
    console.log('StringTimeLine', result);
    return result;
  }


  openModal(template: TemplateRef<any>, day) {
    this.dayToSched = day;
    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
  }

  confirmTime(time) {
    this.addSchedToDay(this.dayToSched, time);
    this.dayToSched = null;
    this.modalRef.hide();
  }

  declineTime() {
    this.dayToSched = null;
    this.modalRef.hide();
  }

}
