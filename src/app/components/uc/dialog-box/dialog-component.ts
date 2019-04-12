import { Component } from '@angular/core';
import { environment } from 'environments/environment.prod';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-dialog',
    templateUrl: 'dialog-component.html',
})

export class DialogComponent {
  public ErrorMsg: string;
  private severity: string;
  private url;
  public title: string;
  public aboutMask: boolean;
  public ErrorMessageIsVisible: boolean;
  public clientVersion: string;
  public buildDate: string;

  constructor(private http: HttpClient) { }

  showErrorMessage(tit: string, msg: string, sev: string) {
      this.ErrorMsg = msg;
      this.title = tit;
      this.severity = sev;
      this.ErrorMessageIsVisible = true;

      if (this.severity === 'About') {
        this.aboutMask = true;
        this.clientVersion = '1.0 ' + environment.clientTypeVersion;
        this.buildDate = '15/10/2018 07:37:55';
      } else {
        this.aboutMask = false;
      }
  }

  hideErrorMsg() {
      this.ErrorMessageIsVisible = false;
  }

  getTitleColor() {
    if (this.severity === 'Error') {
      return '#a00';
    } else {
      return '#0a0';
    }
  }
}
