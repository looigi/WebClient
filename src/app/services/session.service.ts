import {Injectable, Inject, forwardRef} from '@angular/core';
import {HttpClient} from './httpclient.service';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class SessionService {
    remember: BehaviorSubject<boolean> = new BehaviorSubject(false);
    user = new BehaviorSubject({username: null});
    token = new BehaviorSubject(null);
    logged: BehaviorSubject<boolean> = new BehaviorSubject(null);
    userName = '';

    constructor(private httpclient: HttpClient
    ) {
      // console.log("Cerco dati nel sessionStorage...")
      /* console.log('LOGIN', this.token, this.user);
      if (sessionStorage
        && sessionStorage.getItem('user')
        && sessionStorage.getItem('token')
      ) {
        // console.log("Recovering data from sessionStorage.. ")
        this.setUser(JSON.parse(sessionStorage.getItem('user')));
        this.setToken(sessionStorage.getItem('token'));
        this.setLogged(true);
      } */
    }

    setUserName(s) {
      this.userName = s;
    }

    setRemember(v: boolean) {
        this.remember.next(v);
      if (!v && sessionStorage) {
        sessionStorage.clear();
      }
    }

    setUser(u: any) {
        this.user.next(u);
        this.httpclient.setHeader('X-Auth-Username', u ? u.username || null : null);
        if (sessionStorage && !!this.remember.getValue()) {
            sessionStorage.setItem(this.getUser().username + '_user', JSON.stringify(u));
        }
    }

    getUser() {
        return this.user.getValue();
    }

    setToken(t) {
        this.token.next(t);
        // this.httpclient.setHeader('X-Auth-Token', t || null);
        // if (sessionStorage && !!this.remember.getValue()) {
        sessionStorage.setItem(this.getUser().username + '_token', t);
        // }
    }

    getToken() {
      // return this.token.getValue();
      // const u = this.getUserName();
      // alert(this.getUser().username + '_token');

      if (this.getUser().username) {
        return sessionStorage.getItem(this.getUser().username + '_token');
      } else {
        sessionStorage.removeItem('token');
        return null;
      }
    }

    setLogged(v: boolean) {
        this.logged.next(v);
    }

    isLogged(): boolean {
        return this.logged.getValue();
    }

    logout() {
      // const u = this.getUserName();

      this.user.next({username: null});
        // this.logged.unsubscribe();

        if (sessionStorage) {
            sessionStorage.removeItem(this.getUser().username + '_token');
        }
    }
}
