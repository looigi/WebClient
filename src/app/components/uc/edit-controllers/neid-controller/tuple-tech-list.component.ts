import {
  Component,
  Input, Output,
  EventEmitter
} from '@angular/core';
import { MapTechnologyComponent } from './map-technology.component';

@Component({
  selector: 'tuple-tech-list',
  styleUrls: ['tuple-tech-list.css'],
  templateUrl: 'tuple-tech-list.html'
})

export class TupleTechListComponent {
  @Input() tupleTechList;
  @Output() roleSiteSelected: EventEmitter<any> = new EventEmitter<any>();
  @Output() resetSiteSelected: EventEmitter<any> = new EventEmitter<any>();

  private selectRoleSite(i) {
    console.log();
    this.roleSiteSelected.emit(i);

    const t = MapTechnologyComponent.t;
    t.drawAOT();
  }

  private resetRoleSite(i) {
    this.resetSiteSelected.emit(i);

    const t = MapTechnologyComponent.t;
    t.drawAOT();
  }
}
