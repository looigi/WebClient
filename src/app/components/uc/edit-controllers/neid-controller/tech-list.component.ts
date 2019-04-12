import {
  Component,
  Input, Output, OnChanges, SimpleChange,
  EventEmitter
} from '@angular/core';



@Component({
  selector: 'tech-list',
  styleUrls: ['tech-list.css'],
  templateUrl: 'tech-list.html'
})

export class TechListComponent implements OnChanges {
  @Input() operatorTechList;
  @Output() changeSelection: EventEmitter<any> = new EventEmitter<any>();

  private operatorTechSelected = null;


  ngOnChanges(changes: {[propName: string]: SimpleChange}) {
    if (changes['operatorTechList']) {
      this. operatorTechSelected = null;
    }
  }


  // Set tecnology for site
  private selectOperatorTech(i) {
    this.operatorTechSelected = i;
    // console.log(this.operatorTechSelected);
    this.changeSelection.emit(this.operatorTechList[i]);
  }


  // Get color for tecnologies table row
  private getColorClass(status, type?) {
    type = type ? type : '';
    switch (status) {
      case 'NotWorking':
        return type + 'danger';
      case 'Working':
        return type + 'success';
      default:
        return type + 'default';
    }
  }
}
