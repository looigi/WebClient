import {Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChange} from '@angular/core';
import {FilterTime} from '../../models/filter-time.model';
import {FormsModule} from '@angular/forms';


@Component({
  selector: 'filter-time',
  template: `
    {{filter.TimeCriteria}}
    <form class="k-form" (ngSubmit)="applyFilter()">
      <div class="row">
        <div class="form-group col-md-3">
          <label class="k-form-field">
            Time Criteria
            <kendo-dropdownlist
              [data]="timeCriterias"
              [valuePrimitive]="true"
              name="timeCriteria"
              [(ngModel)]="filter.timeCriteria"
              (ngModelChange)="criteriaSelected()"
              id="timeCriterias"
            >
            </kendo-dropdownlist>
          </label>
        </div>
        <div class="form-group col-md-3"
             *ngIf="filter.timeCriteria && filter.timeCriteria!='DataRange'"
        >
          <label class="k-form-field">
            Period
            <kendo-numerictextbox
              [min]="1"
              [decimals]=0
              [format]="'n0'"
              name="timeRange"
              [(ngModel)]="filter.timeRange"
              id="timeRange"
            >
            </kendo-numerictextbox>
          </label>
        </div>
        <div class="form-group col-md-3" *ngIf="filter.timeCriteria=='DataRange'">
          <label class="k-form-field">
            From
            <kendo-datepicker
              [format]="'yyyy-MM-dd HH:mm:ss'"
              name="dateFrom"
              [(ngModel)]="filter.dateFrom"
              id="dateFrom"
            ></kendo-datepicker>
          </label>
        </div>
        <div class="form-group col-md-3" *ngIf="filter.timeCriteria=='DataRange'">
          <label class="k-form-field">
            To
            <kendo-datepicker
              [format]="'yyyy-MM-dd HH:mm:ss'"
              name="dateTo"
              [(ngModel)]="filter.dateTo"
              id="dateTo"
            ></kendo-datepicker>
          </label>
        </div>
        <div class="form-group col-md-2" *ngIf="filter.timeCriteria">
          <label class="k-form-field">&nbsp;
            <div>
              <button type="submit" class="k-button" style="width:28px; height: 28px">
                <span class="glyphicon glyphicon-refresh"></span>
              </button>
            </div>
          </label>
        </div>
      </div>
    </form>
  `
})


export class FilterTimeComponent implements OnChanges {
  @Input() filter;
  @Output() onFilterApply: EventEmitter<FilterTime> = new EventEmitter<FilterTime>();
  @Output() onCriteriaSelect: EventEmitter<boolean> = new EventEmitter<boolean>();
  timeRange: [number];

  timeCriterias = ['DataRange', 'Minutes', 'Hour', 'Days', 'Week', 'Month', 'Quarter', 'Year'];

  constructor(){
  }

  ngOnChanges(changes:{[propName:string] : SimpleChange}) {
    if (this.filter.timeCriteria) this.criteriaSelected();
  }

  applyFilter() {
    this.onFilterApply.emit(this.filter);
  }


  criteriaSelected() {
    this.onCriteriaSelect.emit(this.filter.timeCriteria != null);
  }

}
