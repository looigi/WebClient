import { Component, TemplateRef, OnInit, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { isObject } from 'util';

@Component({
  selector: 'app-popup-requests',
  templateUrl: './popupRequests.component.html'
})

export class PopupRequestsComponent implements OnInit {
  static p: PopupRequestsComponent;
  requests;
  tcrunid;
  showPopup = false;

  constructor() {
  }

  ngOnInit() {
    PopupRequestsComponent.p = this;
  }

  public get animate(): any {
    return {
      type: 'zoom',
      direction: 'down',
      duration: 300
    };
  }

  openModal(req) {
    this.requests = req;
    this.showPopup = true;
  }
}
