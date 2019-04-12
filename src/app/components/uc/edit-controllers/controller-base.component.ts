import {Component, EventEmitter, Input, Output} from '@angular/core';

export class ControllerBaseComponent {
  @Input() data: any;
  @Output() submitted: EventEmitter<any> = new EventEmitter<any>();

  refresh() {}

  submit() {
    this.submitted.emit(this.data.payload);
  }
}
