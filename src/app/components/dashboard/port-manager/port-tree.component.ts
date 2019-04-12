import {Component, ViewChild} from '@angular/core';
import {ApiService} from '../../../services/api.service';

import {PanelBarItemModel} from '@progress/kendo-angular-layout';
import {Router} from '@angular/router';
import {PortMainComponent} from './port-manager';

@Component({
  styleUrls: ['port-tree.css'],
  templateUrl: 'port-tree.html'
})

export class PortTreeComponent {
  @ViewChild('component1') component1: PortMainComponent;

  public eventPortTree: Array<any>;

    constructor(private apiService: ApiService, private router: Router) {
        this.queryTSS();
    }

    private queryTSS(): void {
        this.apiService.getPortTree()
            .map(response => response.json())
            .map(response => response.DataTable)
            .subscribe(reports => {
                const root_id = 'CATEGORY is not null';

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
                this.eventPortTree = reports.filter(e => e.OBJ_ID === root_id).map(e => addChildren(e, reports));
            });
    }

    public stateChange(data: Array<PanelBarItemModel>): boolean {
      const focusedEvent: PanelBarItemModel = data.filter(item => item.focused === true)[0];
      const categoryID = focusedEvent.id.substring(focusedEvent.id.indexOf('\'') + 1, focusedEvent.id.lastIndexOf('\''));

      this.router.navigate(['/dashboard/port-manager'], {queryParams: {category: categoryID}});

      return false;
    }

}
