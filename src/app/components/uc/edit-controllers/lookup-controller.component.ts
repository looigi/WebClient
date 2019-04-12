import {Component, Input, OnInit} from '@angular/core';
import {ControllerBaseComponent} from './controller-base.component';
import {ApiService} from '../../../services/api.service';

@Component({
  selector: 'lookup-edit-controller',
  templateUrl: 'lookup-controller.html'
})

export class LookupEditComponent extends ControllerBaseComponent implements OnInit {

  @Input() data;
  name;
   options;
   selectedItem;

  constructor(private apiService: ApiService) {
    // Run base constructor
    super();
    // Child component constructor logic...
  }

  ngOnInit() {
    this.name = this.data.payload.PrmList[0].Name.replace(/</g, '').replace(/>/g, '');
    this.selectedItem =  this.data.payload.PrmList[0].Value;
    const filter = 'TD_PRM_NAME=\'' + this.data.payload.PrmList[0].Name + '\'';

      this.apiService.getLookUpDomainOptions(filter)
      .map(res => res.json())
      .subscribe(res => {
        this.options = res.DataTable;
      });
  }

}
