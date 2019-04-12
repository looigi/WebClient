import {BsModalRef} from 'ngx-bootstrap/modal';
import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'add-modal-content',
  styleUrls: ['add-modal.css'],
  templateUrl: 'add-modal.html'
})
export class AddModalComponent implements OnInit {
  private item = {};
  public title = 'Modal';


  constructor(public bsModalRef: BsModalRef) {}

  public hide(): void {
    this.bsModalRef.hide();
  }

  ngOnInit() {

  }

}
