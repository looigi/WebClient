import {
  Component, Input, EventEmitter, Output, OnChanges,
  SimpleChange,
  OnInit
} from '@angular/core';
import {PanelBarItemModel} from '@progress/kendo-angular-layout';
import { AntsGridComponent } from 'app/components/uc/ants-grid/ants-grid.component';


@Component({
  selector: 'tc-run-deail-trace-tree',
  styleUrls: ['tc-run-deail-trace-tree.css'],
  templateUrl: 'tc-run-detail-trace-tree.html'
})

export class TcRunDetailTraceTreeComponent implements OnInit, OnChanges {
  static t: TcRunDetailTraceTreeComponent;

  @Input() tcRunTraceTree;
  @Input() iconPath;
  @Output() tcRunTraceFilter: EventEmitter<any> = new EventEmitter<any>();

  tcRunTraceTreeData: Array<any>;
  private rootId;

  ngOnInit() {
    TcRunDetailTraceTreeComponent.t = this;
  }

  ngOnChanges(changes: {[propName: string]: SimpleChange}) {
    if (changes['tcRunTraceTree']) {
      try {
        this.rootId = this.tcRunTraceTree.filter(node => node.NODE_TYPE === 'root')[0].OBJ_ID;
        this.tcRunTraceTreeData = this.tcRunTraceTree.filter(
          root => root.OBJ_ID === this.rootId).map(e => this.addChildren(e));
      } catch (e) {

      }
    }
    // console.log('TC RUN TREE', this.tcRunTraceTreeData );
  }

  clickOnLast() {
    const i = this.tcRunTraceTree.length - 1;
    if (i > -1) {
      try {
        /* let ii = 0;
        let ee;
        let iii = -1;

        for (let index = 0; index < this.tcRunTraceTree.length; index++) {
          const element = this.tcRunTraceTree[index];
          if (element.NODE_TYPE === 'Phase') {
            iii = index - 1;
          }
        }
        this.tcRunTraceTree.expand(ee); */

        this.tcRunTraceTree[i].selected = true;
        this.tcRunTraceTree[i].focused = true;

        if (this.tcRunTraceTreeData && this.tcRunTraceTreeData[0]) {
          const mP = this.tcRunTraceTreeData[0].children.length - 1;
          this.tcRunTraceTreeData[0].children[mP].expanded = true;
          const mF = this.tcRunTraceTreeData[0].children[mP].children.length - 1;
          this.tcRunTraceTreeData[0].children[mP].children[mF].selected = true;
        }

        // const fff = this.tcRunTraceTree.filter(item => item.focused === true)[0]['OBJ_ID'];
        const fff = this.tcRunTraceTree[i]['OBJ_ID'];
        const ff = fff.replace(/'/g, '"');
        const filter = JSON.parse(ff);

        // const s = '{ "PhaseId": "' + filter.PhaseId + '", "PhaseIteration": "' + filter.PhaseIteration + '", ' +
        //   '"Role": "' + filter.Role + '", "StepId": "' + filter.StepId + '", "StepIteration": "' + filter.StepIteration + '"}';
        // const ss = JSON.parse(s);
        // console.log('selezione menu:', filter);
        // console.log(JSON.parse('{"pippo":"","pluto":0}'));
        if (filter) {
          // filter = filter.replace(/'/g, '"');
          // this.stateChange([{"LABEL": label, expanded: true, selected: true}]);
          this.tcRunTraceFilter.emit(filter);
        }
      } catch (e) {
        console.log(e);
      }
    }
  }

  addChildren(node) {
    const treeNode = <PanelBarItemModel>{
      id: node.OBJ_ID,
      title: ' ' + node.LABEL,
      children: [],
      expanded: node.OBJ_ID === this.rootId,
      imageUrl: './assets/img/icons/' + node.IMAGE
    };
      // imageUrl: this.iconPath ? this.iconPath + '/' + node.IMAGE : ''

    treeNode.children = this.tcRunTraceTree
      .filter(child => child.FATHER_ID === node.OBJ_ID)
      .map(father => this.addChildren(father));

    return treeNode;
  }

  stateChange(data: Array<PanelBarItemModel>) {
    const filter = JSON.parse(data.filter(item => item.focused === true)[0]['id'].replace(/'/g, '"'));

    // console.log('selezione menu:', filter);
    // console.log(JSON.parse('{"pippo":"","pluto":0}'));
    this.tcRunTraceFilter.emit(filter);
  }
}
