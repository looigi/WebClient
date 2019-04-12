import {Component, OnInit, Input, EventEmitter, Output, SimpleChanges, OnChanges} from '@angular/core';
import {State } from '@progress/kendo-data-query';

import {
    DataStateChangeEvent
} from '@progress/kendo-angular-grid';
import {ApiService} from '../../../services/api.service';
import {SelectionEvent} from '@progress/kendo-angular-dropdowns/dist/es/selection.service';

@Component({
    selector: 'ts-run-list',
    templateUrl: 'ts-run-list.html'
})
export class TSRunListComponent implements OnInit, OnChanges {

    @Input() filter: string;
    @Output() itemSelected: EventEmitter<string> = new EventEmitter<string>();

    public requestInProgress  = false;

    public state: State = {
        skip: 0,
        take: 5
    };

    public gridData;
    public selectedItem;

    protected dataStateChange(state: DataStateChangeEvent): void {
        this.state = state;
        // this.gridData = process(sampleProducts, this.state);
    }

    protected selectionChanged(selection): void {
        this.selectedItem = selection.selected ? this.gridData[selection.index] : null;
        // console.log(this.selectedItem);
        this.itemSelected.emit(this.selectedItem && this.selectedItem.ANTS_ID);
    }

    constructor(private apiService: ApiService) { }

    ngOnInit () {  }

    ngOnChanges(changes: SimpleChanges) {
        // changes contains the old and the new values for each data-bound...
        if (changes.filter.previousValue !== changes.filter.currentValue) {
            this.requestInProgress  = true;
            // request to webservice
            this.apiService.getTSRun(changes.filter.currentValue)
                .map(response => response.json())
                .subscribe(data => {
                    // console.log('TSRUN Response: ', data.DataTable)
                    this.gridData =  data.DataTable;
                    this.requestInProgress = false;
                }, error => {
                    this.requestInProgress = false;
                    console.warn(error);
                });
        }
    }
}
