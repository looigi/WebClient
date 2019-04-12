import { Component } from '@angular/core';
import {SessionService} from '../../../services/session.service';
import {Router, ActivatedRoute} from '@angular/router';
import {ApiService} from '../../../services/api.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DashboardHeaderComponent } from '../main/header/header.component';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from '../../../validators/password-confirm.validator';

@Component({
    selector: 'login-component',
    templateUrl: 'login.component.html',
    styleUrls: ['login.style.css']
})

export class LoginComponent {
  Username;
  Password;
  username;
  password;
  rememberme;
  requestInProgress = false;
  errMsg: String = '';
  TcRunId;
  AutoLoginKey;
  changePassword = false;
  changePswForm: FormGroup;
  messageLog = '';
  user = '';
  sessionId = '';

  public buttami: any[] = [
    936, 968, 1025, 999, 998, 1014, 1017, 1010, 1010, 1007,
    1004, 988, 990, 988, 987, 995, 946, 954, 991, 984,
    974, 956, 986, 936, 955, 1021, 1013, 1005, 958, 953,
    952, 940, 937, 980, 966, 965, 928, 916, 910, 980
  ];

  Buttami0 = [0, 1, 2, 3, 4, 5, 6, 7];
  Buttami1 = [84, 144, 144, 144, 144, 144, 144, 124];
  Buttami2 = [0, 0, 0, 0, 0, 0, 0, 7];
  Buttami3 = [28, 48, 48, 48, 48, 48, 48, 42];

  constructor (
      private sessionService: SessionService,
      private apiService: ApiService,
      private router: Router,
      private fb: FormBuilder,
      private activatedRoute: ActivatedRoute,
  ) {
    // http://localhost:4200/login?tcrunid=156694548&key=999
    // Utilizzare questa chiamata per l'auto login
    this.activatedRoute.queryParams.subscribe(params => {
        this.TcRunId = params['tcrunid'];
        this.AutoLoginKey = params['key'];
        if (this.TcRunId !== undefined &&
          this.AutoLoginKey !== undefined) {
          this.login('WebDetailedInfo', '124389', false);
          // this.login('Luigi.Pecce', 'latitude', false);
        }
      });
    }

    login(username, password, rememberme) {
        this.requestInProgress = true;
        this.apiService.login({username: username, password: password, groupname: 'ANTSNVL'})
            .map(response => response.json())
            .subscribe(
              data => {
                this.requestInProgress = false;
                if (data) {
                  const dd = data.OBJECT[0].object;
                  const rr = data.RESULT[0].message;

                  if (rr === 'Ok') {
                    this.sessionService.setRemember(rememberme);
                    this.sessionService.setUser(dd);
                    this.sessionService.setToken(dd.sessionId);
                    this.sessionService.setLogged(true);

                    const name = dd.username;
                    let i = localStorage.length;
                    while (i--) {
                      const key = localStorage.key(i);
                      if (key.indexOf(name) > -1 && (key.indexOf('PendingRequest') > -1 || key.indexOf('requestStartTimeStamp') > -1)) {
                        localStorage.removeItem(key);
                      }
                    }

                    if (this.TcRunId === undefined) {


                      this.apiService.getHeaderInfo()
                      .map(response => response.json())
                      .subscribe(
                       data2 => {
                         if (data2 && data2.DataTable) {
                          DashboardHeaderComponent.sPassword = password;
                          DashboardHeaderComponent.sUserData = data2;
                            // this.userDataProfile = dataProfile.Table[0];
                          DashboardHeaderComponent.sHideScheduler =  data2.DataTable[0].TestScenario;
                          DashboardHeaderComponent.sHideReport =  data2.DataTable[0].Olap;
                          DashboardHeaderComponent.sHideAdhoc = data2.DataTable[0].TestScenario;
                          DashboardHeaderComponent.sHideSiteCoverage = data2.DataTable[0].NetworkDb;
                          DashboardHeaderComponent.sHideEventLog = data2.DataTable[0].Event;
                          DashboardHeaderComponent.sHideSimManager = data2.DataTable[0].Sim;
                          DashboardHeaderComponent.sHidePortManager = data2.DataTable[0].Rtu;
                          DashboardHeaderComponent.sPlatformName =  data2.DataTable[0].PlatformName;
                          // this.platformData =  data.DataTable[0].PlatformData;
                          DashboardHeaderComponent.sUserName = data2.DataTable[0].UserName;
                          DashboardHeaderComponent.sHideAnalytics = 'false';
                          DashboardHeaderComponent.sSymb_TimeStamp =
                            'Time of the remote server  (' + data2.DataTable[0].TimeZone + '). ' +
                            'All timestamps are reported in the remote server time';
                          DashboardHeaderComponent.sMail = data2.DataTable[0].Mail;
                          DashboardHeaderComponent.sDateNowH = '';

                          if (DashboardHeaderComponent.sHideScheduler === undefined ||
                            DashboardHeaderComponent.sHideScheduler === 'false') {
                            this.router.navigate(['dashboard/app-empty-page']);
                          } else {
                            this.router.navigate(['dashboard']);
                          }
                        }
                      }
                       ,
                        error =>  {
                        // TODO alert error
                        });
                    } else {
                      this.router.navigateByUrl('dashboard/scheduler?filter=autoLogin&tcrunid=' +
                        this.TcRunId + '&key=' + this.AutoLoginKey);
                    }
                  } else {
                    this.errMsg = rr;
                    if (this.errMsg.toUpperCase().indexOf('CHANGE A PASSWORD') > -1) {
                      this.messageLog = '';
                      this.changePswForm = this.fb.group({
                        oldPassword: ['', [Validators.required , Validators.minLength(3)]],
                        newPassword1: ['', [Validators.required , Validators.minLength(3)]],
                        newPassword2: ['', [Validators.required , Validators.minLength(3)]]
                      }, {validator: Validators.compose([CustomValidators.passwordConfirm , CustomValidators.passwordMatch])});

                      this.user = data.OBJECT[0].object. username;
                      this.sessionId = data.OBJECT[0].object. sessionId;
                      this.changePassword = true;
                    }
                  }
                }
              },
              (error) => {
                this.requestInProgress = false;
                // const err: string = error.error;
                // const parsedError = Object.assign({}, error, { error: JSON.parse(error.error) });
                // const e = err.split(',');

                // this.errMsg = error;
                if (error instanceof Error) {
                  this.errMsg = 'An error occurred:' + error.message;
                } else {
                  const ee = error._body.split(',');

                  while (ee[1].indexOf('"') > -1) {
                    ee[1] = ee[1].replace('"' , '');
                  }
                  ee[1] = ee[1].replace('message', '');
                  this.errMsg = `${ee[1]}`;
                }
              }
            );
    }

    closeCP() {
      this.changePassword = false;
    }

    onSubmit() {
      // if (DashboardHeaderComponent.sPassword !== this.changePswForm.value.oldPassword) {
      //   this.messageLog = 'OLD Password is invalid';
      // } else {
        // console.log(this.changePswForm.value);
        // console.log(this.changePswForm.status);

        const operatorData: any = {
            'operatorId': this.user,
            'sessionID': this.sessionId,
            'newPassword': this.changePswForm.value.newPassword1,
            'oldPassword': this.changePswForm.value.oldPassword,
        };
        this.apiService.operatorSetPassword(operatorData)
          .subscribe(result => {
            this.messageLog = 'SAVED!';
            // this.modalService.hide(1);
            // this.router.navigate(['dashboard']);
            this.changePassword = false;
            this.errMsg = '';
        },
          error => {
            const errors = error;
            this.messageLog = 'ERROR: ' + errors;
          }); ;
      // }
    }
  }
