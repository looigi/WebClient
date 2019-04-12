import { Component, OnInit, ViewChild } from '@angular/core';
import {Params, ActivatedRoute} from '@angular/router';
import { ModalService } from '../../../services/modal.service';
import { filter } from 'rxjs/operators';
import { AdHocComponent } from './adhoc.component';
import { Observable} from 'rxjs/Rx';

@Component({
    templateUrl: 'adhoc-container.html'
})

export class AdHocContainerComponent implements OnInit {
  @ViewChild(AdHocComponent) tsList: AdHocComponent;
   td = null;
   ts = '';
   tc = '';

  constructor(private activatedRoute: ActivatedRoute, private modalService: ModalService) {
    // this.modalService.modalShowChanges.filter(modale => modale.modal === 'tsEditor' && modale.action === 'close')
    //   .subscribe(() => this.tsList.ngOnInit());
      this.modalService.modalShowChanges.pipe(
        filter(modale => modale.modal === 'tsEditor' && modale.action === 'close')
      ).subscribe(() => this.tsList.ngOnInit());
    }

  ngOnInit () {
    // subscribe to query params change
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      // console.log('PARAMS', params);
      this.td = params['filter'];
      this.ts = null;
      this.tc = null;
    });
  }

  onAdHocScenarioSelected(message) {
    // console.log('Selected TestScenario id: ' , message);
    /* const myVar = setTimeout(() => {
      if (message !== null) {
        this.ts = {...message};
        this.tc = null;
      }
      clearInterval(myVar);
    }, 100); */

    const subscribe = Observable.timer(0, 100)
      .take(1)
      .subscribe(() => {
        if (message !== null) {
          this.ts = {...message};
          this.tc = null;
          subscribe.unsubscribe();
        }
    });

    // this.ts = message;
  }

  onAdHocTcRunSelected(message) {
    // console.log('Selected TestScenario id: ' , message);
    /* const myVar = setTimeout(() => {
      if (message !== null) {
        this.tc = {...message};
      }
      clearInterval(myVar);
    }, 100); */

    const subscribe = Observable.timer(0, 100)
      .take(1)
      .subscribe(() => {
        if (message !== null) {
          this.tc = {...message};
          subscribe.unsubscribe();
        }
    });

    // this.ts = message;
  }

  updateTsList() {
    this.tsList.ngOnInit();
  }
}
