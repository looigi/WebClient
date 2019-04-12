import { Component, TemplateRef, Input, ViewChild } from '@angular/core';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../../../validators/password-confirm.validator';
import { ApiService } from '../../../services/api.service';
import { SessionService } from '../../../services/session.service';
import { DashboardHeaderComponent } from '../main/header/header.component';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html'
})

export class ChangePasswordComponent {
  @ViewChild('template') template: TemplateRef<any>;

  modalRef: BsModalRef;

  changePswForm: FormGroup;
  messageLog = '';

  constructor(private modalService: BsModalService, private fb: FormBuilder, private apiService: ApiService,
    private sessionService: SessionService ) {
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
    this.createForm();
  }

  close() {
    this.modalService.hide(1);
  }

  createForm() {
    this.messageLog = '';
    this.changePswForm = this.fb.group({
      oldPassword: ['', [Validators.required , Validators.minLength(3)]],
      newPassword1: ['', [Validators.required , Validators.minLength(3)]],
      newPassword2: ['', [Validators.required , Validators.minLength(3)]]
    }, {validator: Validators.compose([CustomValidators.passwordConfirm , CustomValidators.passwordMatch])});
  }

  onSubmit() {
    // if (DashboardHeaderComponent.sPassword !== this.changePswForm.value.oldPassword) {
    //   this.messageLog = 'OLD Password is invalid';
    // } else {
      console.log(this.changePswForm.value);
      console.log(this.changePswForm.status);

      const operatorData: any = {
          'operatorId': this.sessionService.getUser().username,
          'sessionID': this.sessionService.getToken(),
          'newPassword': this.changePswForm.value.newPassword1,
          'oldPassword': this.changePswForm.value.oldPassword,
      };
      this.apiService.operatorSetPassword(operatorData)
        .subscribe(result => {
          this.messageLog = 'SAVED!';
          this.modalService.hide(1);
        },
        error => {
          const errors = error;
          this.messageLog = 'ERROR: ' + errors;
        }); ;
    // }
  }
}
