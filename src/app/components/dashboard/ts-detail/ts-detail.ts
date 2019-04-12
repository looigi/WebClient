import {
  Component, OnInit, Input, OnChanges,
  SimpleChange,
  Inject,
  forwardRef
} from '@angular/core';
import {ModalService} from '../../../services/modal.service';
import { GeneralGridComponent } from '../../uc/ants-grid/generalGrid.component';
import { environment } from 'environments/environment';

import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';

@Component({
  selector: 'ts-detail',
  styles: [`
    /* .tab-content {
      border-left: 1px solid #ddd;
      border-bottom: 1px solid #ddd;
      border-right: 1px solid #ddd;
      padding: 13px;
    } */

    .k-grid {
      min-height: 99%;
      max-height: 99%;
      max-width: 98%;
    }

  `],
  templateUrl: 'ts-detail.html'
})

export class TsDetailComponent implements OnInit, OnChanges {
  static t: TsDetailComponent;

  @Input() ts;

  public l3Text;

  public tsFiles = null;

  public maskName = 'ts-files';

  public title;

  public url: SafeResourceUrl;

  private isAlreadyLoaded = false;

  c: {[propName: string]: SimpleChange};

  constructor(
    public sanitizer: DomSanitizer,
    public modalService: ModalService,
    @Inject(forwardRef(() => GeneralGridComponent)) private gridGeneral2: GeneralGridComponent
  ) {}

  ngOnInit() {
    this.title = 'Test Scenario Run ' + this.ts;
    TsDetailComponent.t = this;

    if (!this.isAlreadyLoaded) {
      if (this.c['ts']) {
        if (this.ts) {
          // The BE use a txt file to buffer services responses
          // => call next service after previous responce is ready
          // this.getTcRunParameters();

          // localStorage.setItem(this.maskName + '_persistence', '1');
          this.gridGeneral2.reloadGrid(this.maskName, this.ts);
        }
      }
    }
  }

  ngOnChanges(changes: {[propName: string]: SimpleChange}) {
    this.c = changes;

    if (this.isAlreadyLoaded) {
      if (changes['ts']) {
        if (this.ts) {
          // The BE use a txt file to buffer services responses
          // => call next service after previous responce is ready
          // this.getTcRunParameters();

          // localStorage.setItem(this.maskName + '_persistence', '1');
          this.gridGeneral2.reloadGrid(this.maskName, this.ts);
          }
      }
    }
  }

  showFile(se) {
    this.url = null;

    const fileName = environment.urlRoot + se.File;
    // const exists = se.Exists;

    // if (exists === 'Y') {
      this.url = this.sanitizer.bypassSecurityTrustResourceUrl(fileName);
      // this.url = fileName;
      // alert(this.url);
      /* const re = /(?:\.([^.]+))?$/;
      let ext: string = re.exec(fileName)[1];
      ext = ext.toUpperCase();

      switch (ext) {
        case 'TXT':
          this.http.get(fileName).subscribe(data => {
            this.fileText = data.text();
          });
          break;
      } */
    // }
  }

  fillGridRun(r: string, d, maskName, ch) {
    if (r.indexOf('ERROR: ') > -1) {
      ch.showAlert(r);
    } else {
      this.tsFiles = d;
    }

    this.gridGeneral2.setAutoFit(maskName);
  }
}
