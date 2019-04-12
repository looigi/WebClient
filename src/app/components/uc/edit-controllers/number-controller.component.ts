import {Component, Input, OnInit} from '@angular/core';
import {ControllerBaseComponent} from './controller-base.component';

@Component({
  templateUrl: 'number-controller.html'
})

export class NumberEditComponent extends ControllerBaseComponent implements OnInit {

  @Input() data;
  name;


  constructor() {
    // Run base constructor
    super();
    // Child component constructor logic...
  }

  ngOnInit() {
    this.name = this.data.payload.PrmList[0].Name.replace(/</g, '').replace(/>/g, '');
  }

}
