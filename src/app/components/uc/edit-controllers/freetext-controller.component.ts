import {Component, Input, OnInit} from '@angular/core';
import {ControllerBaseComponent} from './controller-base.component';
import {ApiService} from '../../../services/api.service';
import { TypeaheadMatch } from 'ngx-bootstrap';

@Component({
  templateUrl: 'freetext-controller.html'
})

export class FreetextEditComponent extends ControllerBaseComponent implements OnInit {
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

  onSelect(event: TypeaheadMatch): void {
    this.data.payload.PrmList[0].Value = event.value;
    // this.selectedItem =  this.data.payload.PrmList[0].Value;
    this.submit();
  }

  update(value: string) {
    let ok = false;

    switch (this.data.payload.DomainType) {
      case '0':
      case '4':
        ok = true;
        break;
      default:
        ok = false;
    }
    if (ok) {
      this.data.payload.PrmList[0].Value = value;
    }
  }
}
