import {Component, ViewEncapsulation} from '@angular/core';
import {ApiService} from '../../../services/api.service';

import {PanelBarItemModel} from '@progress/kendo-angular-layout';
import {Router} from '@angular/router';
import { ModalService } from '../../../services/modal.service';
import { filter } from 'rxjs/operators';
import { DashboardHeaderComponent } from '../main/header/header.component';

@Component({
  styleUrls: ['ts-tree.css'],
  templateUrl: 'ts-tree.html'
})

export class TsTreeComponent {
  testScenarioTree: Array<any>;

  private isAlreadyLoaded = false;
  nodeList;

  constructor(private apiService: ApiService,
              private modalService: ModalService,
              private router: Router) {
    this.queryTSS();
    // this.modalService.modalShowChanges.filter(modale => modale.modal === 'tsEditor' && modale.action === 'close')
    //  .subscribe(() => this.queryTSS());

      this.modalService.modalShowChanges.pipe(
        filter(modale => modale.modal === 'tsEditor' && modale.action === 'close')
      ).subscribe(() => this.queryTSS());
  }

  queryTSS(): void {
    if (!this.isAlreadyLoaded) {
      this.isAlreadyLoaded = true;
      this.apiService.getTSTree()
        .map(response => response.json())
        .map(response => response.DataTable)
        .subscribe(scenarios => {

        this.nodeList = scenarios;
        // console.log('TS Tree response:', scenarios);

        const root_id = 'root'; // hardcoded: l'id del root node

        function addChildren(node, array) {
          const treenode = <PanelBarItemModel>{
            id: node.OBJ_ID,
            title: ' ' + node.LABEL,
            children: [],
            expanded: node.OBJ_ID === root_id,
            // icon: node.NODE_TYPE === 'Folder' ? 'folder' : 'file'
            imageUrl: node.NODE_TYPE === 'Folder' ? 'assets/img/icons/Folder-C.png' : 'assets/img/icons/FullList.png'
          };
          // console.log('Adding children to..' , treenode.title)
          // console.log("array : ", array);
          treenode.children = array
            .filter(current => {
              return current.FATHER_ID === treenode.id;
            })
            .map(current => addChildren(current, array));

          return treenode;
        }
        if (scenarios && scenarios.filter) {
          this.testScenarioTree = scenarios.filter(e => e.OBJ_ID === root_id).map(e => addChildren(e, scenarios));
        }
      });
    }
}

  public stateChange(data: Array<PanelBarItemModel>): boolean {
    const focusedEvent: PanelBarItemModel = data.filter(item => item.focused === true)[0];
    let filter = null;
    this.nodeList.forEach(element => {
      if (!filter) {
        if (element.OBJ_ID === focusedEvent.id) {
          filter = element.FILTER;
        }
      }
    });
    console.log('selezione menu:', filter);
    this.router.navigate(['/dashboard/scheduler'], {queryParams: {filter: filter}});
    return false;
  }
}
