import { Component, TemplateRef, Input, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html'
})
export class ProfileComponent {

  @Input() data: any;
  @ViewChild('template') template: TemplateRef<any>;

  modalRef: BsModalRef;

  profileForm: FormGroup;

  constructor(private modalService: BsModalService, private fb: FormBuilder) {
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
    console.log(this.data);

    this.createForm();
  }

  close() {
    this.modalService.hide(1);
  }

  createForm() {
    this.profileForm = this.fb.group({
      name: this.data.DataTable[0].UserName,
     // email: this.data.EMAIL,
      groupName: this.data.DataTable[0].GroupName, // this.data.DataTable[0].GROUP_NAME,
      // description: this.data.DESCRIPTION,
      // mobile: this.data.MOBILE,
      profileName:  this.data.DataTable[0].OperatorProfileName,
      profileDescription:  this.data.DataTable[0].OperatorProfileDescription
      // clientPath: this.data.REPOSITORY_CLIENT_PATH
    });
  }

  onSubmit() {
    console.log(this.profileForm.value);
    this.modalService.hide(1);
  }
}
