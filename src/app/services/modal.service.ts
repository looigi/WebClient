import {Observable, Subject} from 'rxjs';
import {Injectable} from '@angular/core';

@Injectable()
export class ModalService {
  private modalShowSource = new Subject<any>();
  private modalDataSource = new Subject<any>();

  modalShowChanges = this.modalShowSource.asObservable();
  modalDataChanges = this.modalShowSource.asObservable();

  modalShow(change: any) {
    this.modalShowSource.next(change);
  }

  modalDataSent(change: any) {
    this.modalDataSource.next(change);
  }
}
