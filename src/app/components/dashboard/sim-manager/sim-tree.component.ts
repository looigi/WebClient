import {Component, ViewChild} from '@angular/core';
import {ApiService} from '../../../services/api.service';

import {PanelBarItemModel} from '@progress/kendo-angular-layout';
import {Router} from '@angular/router';
import {SimMainComponent} from './sim-manager';
import { AntsGridComponent } from 'app/components/uc/ants-grid/ants-grid.component';

@Component({
  styleUrls: ['sim-tree.css'],
    templateUrl: 'sim-tree.html'
})

export class SimTreeComponent {
  @ViewChild('component1') component1: SimMainComponent;

  public eventSimTree: Array<any>;

    constructor(private apiService: ApiService, private router: Router) {
        this.queryTSS();
    }

    private queryTSS(): void {
        this.apiService.getSimTree()
            .map(response => response.json())
            .map(response => response.DataTable)
            .subscribe(reports => {
              const root_id = 'CATEGORY is not null';
              // const root_id = 'CATEGORY = \'root\' ';

                function addChildren(node, array) {
                    const treenode = <PanelBarItemModel>{
                        id: node.OBJ_ID,
                        title: ' ' + node.LABEL,
                        children: [],
                        expanded: node.OBJ_ID === root_id,
                        // icon: node.NODE_TYPE === 'Folder' ? 'folder' : 'file'
                    };

                    treenode.children = array
                        .filter(current => {
                            return current.FATHER_ID === treenode.id;
                        })
                        .map(current => addChildren(current, array));

                    return treenode;
                }
                if (reports) {
                    this.eventSimTree = reports.filter(e => e.OBJ_ID === root_id).map(e => addChildren(e, reports));
                }
            });
    }

    public stateChange(data: Array<PanelBarItemModel>): boolean {
      const rowsModified = AntsGridComponent.rowsModified;
      let Ok = false;

      if (rowsModified === true) {
        if (confirm('Are you sure to discard changes ?')) {
          Ok = true;
          AntsGridComponent.rowsModified = false;
        }
      } else {
        Ok = true;
      }

      if (Ok === true) {
        const focusedEvent: PanelBarItemModel = data.filter(item => item.focused === true)[0];
        const categoryID = focusedEvent.id.substring(focusedEvent.id.indexOf('\'') + 1, focusedEvent.id.lastIndexOf('\''));

        this.router.navigate(['/dashboard/sim-manager'], {queryParams: {category: categoryID}});
      }

      return false;
    }

}
